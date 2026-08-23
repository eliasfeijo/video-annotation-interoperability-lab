import type { SvgBox, SvgRootAttrs, Viewport } from "./types.ts";

/**
 * Reference-consumer SVG placement (Renderer A reading).
 *
 * The pure SVG root-attribute parsing that used to live here
 * (readSvgRootAttrs / parseViewBox / svgInnerContent) is a renderer-neutral,
 * policy-free primitive and moved to src/primitives/svg-root.ts in Phase
 * H.2-A; import it from there.
 *
 * What remains here is reference-owned: the synthesized-viewBox placement
 * reading and its landmark predictor. On a body WITHOUT a viewBox this
 * module synthesizes one from width/height and applies the default fit — the
 * deliberate opposite of the packet's 1:1 reading implemented in
 * src/primitives/region-as-viewport-placement.ts (docs/ambiguities.md #1/#5).
 * These two readings must never be merged.
 */

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
  // Align tokens capitalize the y part ("xMidYMid"): match case-insensitively.
  const oy = /yMax/i.test(par) ? h - vh * s : /yMid/i.test(par) ? (h - vh * s) / 2 : 0;
  return { x: x + ox + ux, y: y + oy + uy };
}