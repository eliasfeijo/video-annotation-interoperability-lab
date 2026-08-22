/**
 * Blind Renderer — SVG placement.
 *
 * Computes how a body SVG is mapped into a Canvas destination region.
 *
 * Normative inputs:
 *   - IIIF 3.0 §5.3: "Renderers must scale content into the space represented
 *     by the Canvas."
 *   - SVG 1.1 §7.9: a nested `<svg>` establishes a viewport whose bounds are
 *     its x/y/width/height.
 *   - SVG 1.1 §7.7: viewBox maps a user-space rectangle to the viewport.
 *   - SVG 1.1 §7.8: preserveAspectRatio (default `xMidYMid meet`); only
 *     applies when a viewBox is present.
 *   - SVG 1.1 §7.3/§7.10: no viewBox => user units equal viewport units (1:1).
 *
 * The destination region is treated as the SVG viewport (per the
 * interpretation packet §5, [DERIVED] from "scale content into the space").
 */

import type { Placement, Rect, SvgBox, SvgRootAttrs } from "./types.ts";

const DEFAULT_PAR = "xMidYMid meet";

export interface PlacementRequest {
  destination: Rect;
  attrs: SvgRootAttrs;
}

export function computePlacement(req: PlacementRequest): Placement {
  const { destination, attrs } = req;
  const par = attrs.preserveAspectRatio ?? DEFAULT_PAR;
  const viewBox = attrs.viewBox ?? null;

  if (!viewBox) {
    // SVG §7.3/§7.10: 1 user unit == 1 viewport unit. Content drawn at user
    // (x, y) lands at destination.x + x, destination.y + y. No viewBox =>
    // preserveAspectRatio is ignored (SVG §7.8).
    return {
      viewport: destination,
      viewBox: null,
      preserveAspectRatio: null,
      mode: "no-viewBox-1to1",
      scale: 1,
      translation: { x: destination.x, y: destination.y },
    };
  }

  const align = par.trim().split(/\s+/)[0] ?? "xMidYMid";
  const meetOrSlice = par.trim().split(/\s+/)[1] ?? "meet";

  if (align === "none") {
    // Non-uniform stretch so the viewBox exactly matches the viewport.
    const sx = destination.w / viewBox.w;
    const sy = destination.h / viewBox.h;
    return {
      viewport: destination,
      viewBox,
      preserveAspectRatio: par,
      mode: "viewBox-none",
      scale: null,
      translation: { x: destination.x, y: destination.y },
    };
  }

  const sx = destination.w / viewBox.w;
  const sy = destination.h / viewBox.h;
  const isMeet = meetOrSlice !== "slice";
  const scale = isMeet ? Math.min(sx, sy) : Math.max(sx, sy);
  const usedW = viewBox.w * scale;
  const usedH = viewBox.h * scale;
  const ox = /xMax/.test(align)
    ? destination.w - usedW
    : /xMid/.test(align)
      ? (destination.w - usedW) / 2
      : 0;
  // Align tokens capitalize the y part ("xMidYMid"): match case-insensitively.
  const oy = /yMax/i.test(align)
    ? destination.h - usedH
    : /yMid/i.test(align)
      ? (destination.h - usedH) / 2
      : 0;
  return {
    viewport: destination,
    viewBox,
    preserveAspectRatio: par,
    mode: isMeet ? "viewBox-meet" : "viewBox-slice",
    scale,
    translation: {
      x: destination.x + ox - viewBox.minX * scale,
      y: destination.y + oy - viewBox.minY * scale,
    },
  };
}

/** Map a user-space point to Canvas space for a computed placement. */
export function canvasPointOf(
  placement: Placement,
  p: { x: number; y: number },
): { x: number; y: number } {
  const v = placement.viewport;
  if (!placement.viewBox) {
    return { x: v.x + p.x, y: v.y + p.y };
  }
  if (placement.mode === "viewBox-none") {
    const sx = v.w / placement.viewBox.w;
    const sy = v.h / placement.viewBox.h;
    return {
      x: v.x + (p.x - placement.viewBox.minX) * sx,
      y: v.y + (p.y - placement.viewBox.minY) * sy,
    };
  }
  const s = placement.scale ?? 1;
  return {
    x: placement.translation.x + p.x * s,
    y: placement.translation.y + p.y * s,
  };
}