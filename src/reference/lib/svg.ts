import type { SvgBox, SvgRootAttrs, Viewport } from "./types.ts";

/**
 * Pure parsing of an SVG root element's attributes. Kept dependency-free so the
 * same functions run under Vitest (Node) and in the browser.
 */

const ROOT_TAG_RE = /<svg\b([^>]*)>/i;
const ATTR_RE = /([A-Za-z_:][A-Za-z0-9_:.\-]*)\s*=\s*"([^"]*)"/g;

export function readSvgRootAttrs(svgText: string): SvgRootAttrs {
  const attrs: SvgRootAttrs = {};
  const root = ROOT_TAG_RE.exec(svgText.trim());
  if (!root) return attrs;
  const tag = root[1]!;
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(tag)) !== null) {
    const name = m[1]!;
    const value = m[2]!;
    if (name === "viewBox") {
      const box = parseViewBox(value);
      if (box) attrs.viewBox = box;
    } else if (name === "preserveAspectRatio") {
      attrs.preserveAspectRatio = value;
    } else if (name === "width") {
      const n = parseUnit(value);
      if (n !== undefined) attrs.width = n;
    } else if (name === "height") {
      const n = parseUnit(value);
      if (n !== undefined) attrs.height = n;
    }
  }
  return attrs;
}

/** Parse `min-x min-y width height` or `min-x,min-y,width,height`. */
export function parseViewBox(value: string): SvgBox | null {
  const nums = value
    .trim()
    .split(/[\s,]+/)
    .map((s) => parseFloat(s))
    .filter((n) => !Number.isNaN(n));
  if (nums.length !== 4) return null;
  const [minX = 0, minY = 0, w = 0, h = 0] = nums as [number, number, number, number];
  if (!(w > 0) || !(h > 0)) return null;
  return { minX, minY, w, h };
}

function parseUnit(value: string): number | undefined {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Strip the outer `<svg ...>` wrapper only, leaving inner content. Used to move
 * a body SVG's content inside the renderer's host `<svg>`.
 */
export function svgInnerContent(svgText: string): string {
  const root = ROOT_TAG_RE.exec(svgText.trim());
  if (!root) return svgText.trim();
  const openTag = root[0];
  const rest = svgText.slice(svgText.indexOf(openTag) + openTag.length);
  const closeTag = rest.lastIndexOf("</svg");
  if (closeTag === -1) return rest.replace(/\/>$/, "").trim();
  return rest.slice(0, closeTag).trim();
}

/**
 * Compute the placement of a nested `<svg>` inside a host that spans the Canvas.
 * The nested element gets x/y/width/height = the target viewport, plus the body's
 * own viewBox/preserveAspectRatio; the browser then applies the standard SVG
 * viewport/viewBox scaling rules.
 */
export function computeNestedSvgPlacement(
  viewport: Viewport,
  attrs: SvgRootAttrs,
  canvasWidth: number,
  canvasHeight: number,
): {
  x: number;
  y: number;
  w: number;
  h: number;
  viewBox?: SvgBox;
  preserveAspectRatio?: string;
} {
  const viewBox = attrs.viewBox ?? {
    minX: 0,
    minY: 0,
    w: attrs.width ?? viewport.w,
    h: attrs.height ?? viewport.h,
  };
  return {
    x: viewport.x,
    y: viewport.y,
    w: viewport.w,
    h: viewport.h,
    viewBox,
    preserveAspectRatio: attrs.preserveAspectRatio ?? "xMidYMid meet",
  };
}

/**
 * Predict where an SVG user-space point lands in Canvas space after placement,
 * mirroring the browser's meet/align logic (used by unit tests and the exp5
 * coordinate-system drift check).
 */
export function canvasPointOfSvgUserPoint(
  p: { x: number; y: number },
  placement: { x: number; y: number; w: number; h: number; viewBox: SvgBox; preserveAspectRatio: string },
): { x: number; y: number } {
  const { x, y, w, h, viewBox } = placement;
  const vw = viewBox.w;
  const vh = viewBox.h;
  const sx = w / vw;
  const sy = h / vh;
  const scale = Math.min(sx, sy);
  // Alignment keywords: xMid/xMin/xMax, yMid/yMin/yMax (and 'none').
  const par = placement.preserveAspectRatio ?? "xMidYMid meet";
  if (par === "none") {
    return { x: x + (p.x - viewBox.minX) * sx, y: y + (p.y - viewBox.minY) * sy };
  }
  const meet = !/slice/.test(par);
  const s = meet ? scale : Math.max(sx, sy);
  const ux = (p.x - viewBox.minX) * s;
  const uy = (p.y - viewBox.minY) * s;
  const ox = /xMax/.test(par) ? w - vw * s : /xMid/.test(par) ? (w - vw * s) / 2 : 0;
  const oy = /yMax/.test(par) ? h - vh * s : /yMid/.test(par) ? (h - vh * s) / 2 : 0;
  return { x: x + ox + ux, y: y + oy + uy };
}