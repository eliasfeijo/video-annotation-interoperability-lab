/**
 * Experiment E16 — analysis infrastructure.
 *
 * Pure geometry + provenance helpers for comparing nested-Canvas composition
 * readings. NOT renderer semantics: renderers keep their own independent code;
 * these helpers exist so tests/reports can compute what each reading of the
 * IIIF 4.0 draft ("scaled to fit that region") predicts, and classify
 * divergences between fill / contain / direct-painting outcomes.
 */

import type { E14Overlay, Rect } from "../e14/types.ts";

export type NestedFit = "fill" | "contain";

export interface FitMap {
  innerW: number;
  innerH: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

/** Linear map inner Canvas -> outer region under a fit reading. */
export function fitMap(innerW: number, innerH: number, region: Rect, fit: NestedFit): FitMap {
  const sx = region.w / innerW;
  const sy = region.h / innerH;
  if (fit === "fill") return { innerW, innerH, scaleX: sx, scaleY: sy, offsetX: region.x, offsetY: region.y };
  const s = Math.min(sx, sy);
  return {
    innerW,
    innerH,
    scaleX: s,
    scaleY: s,
    offsetX: region.x + (region.w - innerW * s) / 2,
    offsetY: region.y + (region.h - innerH * s) / 2,
  };
}

/** Landmark (user point in an inner SVG) -> outer Canvas coordinates. */
export function landmarkToOuter(
  fit: FitMap,
  innerPlacement: { translation: { x: number; y: number }; scale: number | null },
  p: { x: number; y: number },
): { x: number; y: number } {
  // user -> inner canvas (viewBox-meet style placement)
  const s = innerPlacement.scale ?? 1;
  const cx = innerPlacement.translation.x + p.x * s;
  const cy = innerPlacement.translation.y + p.y * s;
  // inner canvas -> outer
  return { x: fit.offsetX + cx * fit.scaleX, y: fit.offsetY + cy * fit.scaleY };
}

/** Same-aspect targets make every plausible fit coincide — record that fact. */
export function fitsCoincide(innerW: number, innerH: number, region: Rect): boolean {
  return Math.abs(region.w / region.h - innerW / innerH) < 1e-9;
}
