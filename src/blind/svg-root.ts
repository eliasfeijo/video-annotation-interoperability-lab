/**
 * Blind Renderer — SVG root attribute parsing.
 *
 * Extracts the placement-relevant attributes of the outermost `<svg>` element:
 * viewBox, preserveAspectRatio, width, height. Implemented from the SVG 1.1
 * grammar for these attributes (Ch. 7). Dependency-free so it runs under
 * Vitest (Node) and in the browser.
 *
 * Provenance: [NORMATIVE] SVG 1.1 §7.7 (viewBox), §7.8 (preserveAspectRatio),
 * §7.2 (width/height).
 */

import type { SvgBox, SvgRootAttrs } from "./types.ts";

const ROOT_TAG_RE = /<svg\b([^>]*)>/i;

interface Attr {
  name: string;
  value: string;
}

/** Parse the attributes of the first `<svg ...>` opening tag. */
export function readSvgRootAttrs(svgText: string): SvgRootAttrs {
  const root = ROOT_TAG_RE.exec(svgText.trim());
  if (!root) return {};
  const attrs: SvgRootAttrs = {};
  for (const a of parseAttrs(root[1]!)) {
    switch (a.name) {
      case "viewBox": {
        const vb = parseViewBox(a.value);
        if (vb) attrs.viewBox = vb;
        break;
      }
      case "preserveAspectRatio":
        attrs.preserveAspectRatio = a.value;
        break;
      case "width": {
        const n = parseNonNegative(a.value);
        if (n !== undefined) attrs.width = n;
        break;
      }
      case "height": {
        const n = parseNonNegative(a.value);
        if (n !== undefined) attrs.height = n;
        break;
      }
    }
  }
  return attrs;
}

function parseAttrs(tagBody: string): Attr[] {
  const out: Attr[] = [];
  const re = /([A-Za-z_:][A-Za-z0-9_:.\-]*)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tagBody)) !== null) {
    out.push({ name: m[1]!, value: m[2]! });
  }
  return out;
}

/** `min-x min-y width height` or `min-x,min-y,width,height`. */
export function parseViewBox(value: string): SvgBox | null {
  const nums = value
    .trim()
    .split(/[\s,]+/)
    .map((s) => parseFloat(s))
    .filter((n) => !Number.isNaN(n));
  if (nums.length !== 4) return null;
  const [minX = 0, minY = 0, w = 0, h = 0] = nums as [
    number,
    number,
    number,
    number,
  ];
  // SVG §7.7: negative is an error; zero disables rendering.
  if (!(w > 0) || !(h > 0)) return null;
  return { minX, minY, w, h };
}

/**
 * Strip the outer `<svg ...>...</svg>` wrapper, leaving inner content, so a body
 * SVG's content can be nested inside the host `<svg>` (SVG 1.1 §5.2). Falls
 * back to the trimmed text when no wrapper is found.
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

function parseNonNegative(value: string): number | undefined {
  // Strip a trailing unit; "100px" == 100 user units (SVG §7.10).
  const m = /^\s*([0-9]*\.?[0-9]+)/.exec(value);
  if (!m) return undefined;
  const n = parseFloat(m[1]!);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}