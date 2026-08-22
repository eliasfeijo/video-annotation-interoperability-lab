/**
 * Experiment E15 — shared evidence data model + named interpretations.
 *
 * These are ANALYSIS INFRASTRUCTURE (like src/e14/comparison.ts), not renderer
 * semantics: they compute where each SVG landmark SHOULD land under each
 * candidate reading of the standards, so measured browser geometry can be
 * classified. No renderer imports these predictions.
 */

export type E15Embedding =
  | "svg-nested-attr"
  | "svg-nested-region"
  | "img-default"
  | "img-fill"
  | "img-contain"
  | "img-none"
  | "object"
  | "background";

export interface E15Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface E15Landmarks {
  W: number;
  H: number;
  frame: E15Rect;
  circle: { cx: number; cy: number; r: number };
  tick: number;
}

export interface E15SvgVariant {
  name: string;
  viewBox: { minX: number; minY: number; w: number; h: number } | null;
  preserveAspectRatio: string | null;
  width: number | null;
  height: number | null;
}

/** A placement = linear map user space -> Canvas space (+ optional clip box). */
export interface E15Map {
  /** user unit -> canvas unit along x / y */
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  /** Visible window in canvas units (clip); null = unclipped. */
  clip?: E15Rect | null;
}

export function mapPoint(m: E15Map, p: { x: number; y: number }): { x: number; y: number } {
  return { x: m.tx + p.x * m.sx, y: m.ty + p.y * m.sy };
}

// ---------------------------------------------------------------------------
// Named interpretations. Each takes (variant, region) and returns the map it
// predicts for the embedding mechanism. Sources cited per interpretation in
// research/e15-report.md.
// ---------------------------------------------------------------------------

/** PAR-aware viewBox->viewport fit used by every spec-literal reading. */
function viewBoxFit(
  viewport: E15Rect,
  vb: { minX: number; minY: number; w: number; h: number },
  par: string,
): E15Map {
  const meetOrSlice = par.trim().split(/\s+/)[1] ?? "meet";
  if (/^none$/i.test(par.trim())) {
    return {
      sx: viewport.w / vb.w,
      sy: viewport.h / vb.h,
      tx: viewport.x - vb.minX * (viewport.w / vb.w),
      ty: viewport.y - vb.minY * (viewport.h / vb.h),
      clip: viewport,
    };
  }
  const sxv = viewport.w / vb.w;
  const syv = viewport.h / vb.h;
  const isMeet = meetOrSlice !== "slice";
  const s = isMeet ? Math.min(sxv, syv) : Math.max(sxv, syv);
  const usedW = vb.w * s;
  const usedH = vb.h * s;
  const ox = /xMax/.test(par) ? viewport.w - usedW : /xMid/.test(par) ? (viewport.w - usedW) / 2 : 0;
  // NOTE: align tokens are case-sensitive in SVG ("xMidYMid"); the y tokens are
  // capitalized ("YMid"/"YMax"), hence the /i flag. A lowercase /yMid/ here
  // silently disabled vertical centering lab-wide until E15 measured it.
  const oy = /yMax/i.test(par) ? viewport.h - usedH : /yMid/i.test(par) ? (viewport.h - usedH) / 2 : 0;
  return {
    sx: s,
    sy: s,
    tx: viewport.x + ox - vb.minX * s,
    ty: viewport.y + oy - vb.minY * s,
    clip: viewport,
  };
}

/**
 * I-REGION-VIEWPORT: the target region IS the SVG viewport.
 * viewBox present -> fitted per preserveAspectRatio (SVG 1.1 §7.7/§7.8).
 * no viewBox     -> 1 user unit == 1 region unit from the region origin
 *                   (SVG 1.1 §7.9/§7.10; preserveAspectRatio ignored §7.8).
 */
export function iRegionViewport(v: E15SvgVariant, region: E15Rect): E15Map {
  if (v.viewBox) return viewBoxFit(region, v.viewBox, v.preserveAspectRatio ?? "xMidYMid meet");
  return { sx: 1, sy: 1, tx: region.x, ty: region.y, clip: region };
}

/**
 * I-INTRINSIC-STRETCH: the browser treats the SVG's intrinsic canvas
 * (width/height attributes per SVG 1.1 §7.12) like a raster bitmap and
 * stretches it into the region (CSS object-fit: fill semantics, CSS Images 3
 * §4.5). This was the empirically observed <img> behavior in E14 case06.
 */
export function iIntrinsicStretch(v: E15SvgVariant, region: E15Rect): E15Map {
  const w0 = v.width ?? v.viewBox?.w ?? region.w;
  const h0 = v.height ?? v.viewBox?.h ?? region.h;
  return {
    sx: region.w / w0,
    sy: region.h / h0,
    tx: region.x,
    ty: region.y,
    clip: region,
  };
}

function containBox(naturalW: number, naturalH: number, region: E15Rect): E15Rect {
  const s = Math.min(region.w / naturalW, region.h / naturalH);
  const w = naturalW * s;
  const h = naturalH * s;
  return { x: region.x + (region.w - w) / 2, y: region.y + (region.h - h) / 2, w, h };
}

/**
 * I-OBJECTFIT-CONTAIN: concrete object size = natural size contained in the
 * region, centered (CSS Images 3 §4.5 `contain`). The browser then maps the
 * SVG's intrinsic canvas (width/height attrs) onto that concrete box
 * non-uniformly per axis — for a contained box this is uniform. A viewBox is
 * honored inside the box via preserveAspectRatio.
 */
export function iObjectFitContain(v: E15SvgVariant, region: E15Rect): E15Map {
  const w0 = v.width ?? v.viewBox?.w ?? region.w;
  const h0 = v.height ?? v.viewBox?.h ?? region.h;
  const box = containBox(w0, h0, region);
  if (v.viewBox) {
    const inner = viewBoxFit(box, v.viewBox, v.preserveAspectRatio ?? "xMidYMid meet");
    return { ...inner, clip: region };
  }
  return { sx: box.w / w0, sy: box.h / h0, tx: box.x, ty: box.y, clip: region };
}

/**
 * I-NATURAL-TOPLEFT: content drawn at its natural size (width/height attrs)
 * with its origin at the embedding-box origin, never scaled by the box
 * (CSS background-size:auto with natural dimensions, CSS Images 3 §4.3.1;
 * also what an unmodified inline <svg> or <object> document does when its
 * root width/height attributes establish the viewport).
 */
export function iNaturalTopLeft(v: E15SvgVariant, region: E15Rect): E15Map {
  const w0 = v.width ?? v.viewBox?.w ?? region.w;
  const h0 = v.height ?? v.viewBox?.h ?? region.h;
  const box: E15Rect = { x: region.x, y: region.y, w: w0, h: h0 };
  if (v.viewBox) {
    // viewBox fits the attribute-sized viewport; attrs == viewBox here, so
    // scale 1 unless PAR says otherwise.
    const inner = viewBoxFit(box, v.viewBox, v.preserveAspectRatio ?? "xMidYMid meet");
    return { ...inner, clip: null };
  }
  return { sx: 1, sy: 1, tx: region.x, ty: region.y, clip: null };
}

/**
 * I-NATURAL-CENTERED: object-fit none — natural size, centered in the region
 * (CSS Images 3 §4.5 `none`, default object-position 50% 50%).
 */
export function iNaturalCentered(v: E15SvgVariant, region: E15Rect): E15Map {
  const w0 = v.width ?? v.viewBox?.w ?? region.w;
  const h0 = v.height ?? v.viewBox?.h ?? region.h;
  const box: E15Rect = {
    x: region.x + (region.w - w0) / 2,
    y: region.y + (region.h - h0) / 2,
    w: w0,
    h: h0,
  };
  if (v.viewBox) {
    const inner = viewBoxFit(box, v.viewBox, v.preserveAspectRatio ?? "xMidYMid meet");
    return { ...inner, clip: region };
  }
  return { sx: 1, sy: 1, tx: box.x, ty: box.y, clip: region };
}

/** Coordinate space an embedding's interpretations are expressed in. */
export const EMBEDDING_SPACE: Record<E15Embedding, "canvas" | "css"> = {
  "svg-nested-attr": "canvas",
  "svg-nested-region": "canvas",
  "img-default": "css",
  "img-fill": "css",
  "img-contain": "css",
  "img-none": "css",
  object: "css",
  background: "css",
};

/** Interpretations each embedding mechanism could legally implement. */
export const INTERPRETATIONS_BY_EMBEDDING: Record<E15Embedding, Array<(v: E15SvgVariant, r: E15Rect) => E15Map>> = {
  // Body inserted as-is into Canvas space: its width/height ATTRIBUTES define
  // the nested viewport (SVG 1.1 §7.9), anchored at the region origin.
  "svg-nested-attr": [iNaturalTopLeft],
  // Lab-stage convention: region IS the viewport (Blind/Renderer A/Native DOM).
  "svg-nested-region": [iRegionViewport],
  "img-default": [iRegionViewport, iIntrinsicStretch],
  "img-fill": [iRegionViewport, iIntrinsicStretch],
  "img-contain": [iObjectFitContain],
  "img-none": [iNaturalCentered],
  object: [iRegionViewport, iIntrinsicStretch, iNaturalTopLeft],
  background: [iNaturalTopLeft],
};

export const INTERPRETATION_NAMES: Record<string, string> = {
  iRegionViewport: "I-REGION-VIEWPORT",
  iIntrinsicStretch: "I-INTRINSIC-STRETCH",
  iObjectFitContain: "I-OBJECTFIT-CONTAIN",
  iNaturalTopLeft: "I-NATURAL-TOPLEFT",
  iNaturalCentered: "I-NATURAL-CENTERED",
};

// ---------------------------------------------------------------------------
// Regions and variants
// ---------------------------------------------------------------------------
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export const REGIONS: Array<{ key: string; fragment: string | null; rect: E15Rect }> = [
  { key: "full", fragment: null, rect: { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H } },
  { key: "half", fragment: "xywh=480,270,960,540", rect: { x: 480, y: 270, w: 960, h: 540 } },
  { key: "square500", fragment: "xywh=710,290,500,500", rect: { x: 710, y: 290, w: 500, h: 500 } },
  { key: "rect43", fragment: "xywh=100,100,800,600", rect: { x: 100, y: 100, w: 800, h: 600 } },
];

const VB1000 = { minX: 0, minY: 0, w: 1000, h: 1000 };
const VB169 = { minX: 0, minY: 0, w: 1920, h: 1080 };

export const VARIANTS: E15SvgVariant[] = [
  { name: "e15-vb1000.svg", viewBox: VB1000, preserveAspectRatio: null, width: 1000, height: 1000 },
  { name: "e15-vb1920x1080.svg", viewBox: VB169, preserveAspectRatio: null, width: 1920, height: 1080 },
  { name: "e15-novb1000.svg", viewBox: null, preserveAspectRatio: null, width: 1000, height: 1000 },
  { name: "e15-novb1920x1080.svg", viewBox: null, preserveAspectRatio: null, width: 1920, height: 1080 },
  { name: "e15-vb1000-min.svg", viewBox: VB1000, preserveAspectRatio: "xMinYMin meet", width: 1000, height: 1000 },
  { name: "e15-vb1000-slice.svg", viewBox: VB1000, preserveAspectRatio: "xMidYMid slice", width: 1000, height: 1000 },
  { name: "e15-vb1000-none.svg", viewBox: VB1000, preserveAspectRatio: "none", width: 1000, height: 1000 },
  { name: "e15-vb1920x1080-min.svg", viewBox: VB169, preserveAspectRatio: "xMinYMin meet", width: 1920, height: 1080 },
  { name: "e15-vb1920x1080-slice.svg", viewBox: VB169, preserveAspectRatio: "xMidYMid slice", width: 1920, height: 1080 },
  { name: "e15-vb1920x1080-none.svg", viewBox: VB169, preserveAspectRatio: "none", width: 1920, height: 1080 },
];

// ---------------------------------------------------------------------------
// Measured record produced by the browser harness
// ---------------------------------------------------------------------------
export interface E15Measured {
  /** CSS-pixel bbox of the red frame within the cell screenshot. */
  frameCss: { minX: number; minY: number; maxX: number; maxY: number } | null;
  circleCss: { cx: number; cy: number; diameterX: number; diameterY: number } | null;
  /** Intrinsic size reported by the browser (<img>.naturalWidth/Height etc.). */
  intrinsic?: { w: number; h: number } | null;
  /** For DOM-queryable embeddings: bbox of the inner svg element (css px). */
  innerSvgBox?: { x: number; y: number; w: number; h: number } | null;
  note?: string;
}

export interface E15CellResult {
  variant: string;
  embedding: E15Embedding;
  regionKey: string;
  fragment: string | null;
  /** css px per canvas unit for this cell */
  k: number;
  measured: E15Measured;
  /** Derived canvas-space landmark geometry (circle centre + radius, frame box). */
  derived: {
    circleCenterCanvas: { x: number; y: number } | null;
    circleRadiusCanvas: { x: number; y: number } | null;
    uniformScale: boolean | null;
  } | null;
  /** Which candidate interpretations match the measurement (within tolerance). */
  matches: string[];
  verdict: "agree" | "diverge" | "unmeasured";
}
