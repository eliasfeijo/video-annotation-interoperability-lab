/**
 * N6 — R-S5: coordinate mapping within R-S4-conforming compositions.
 *
 * Pure deterministic calculation over LOGICAL Canvas coordinates
 * (profile-draft.md R-S5, Part 7.3):
 *
 *   painted form:     (u,v) ↦ (Tx + k·u, Ty + k·v),  k = Tw/Wb = Th/Hb
 *   replacement form: (x,y) ↦ (k·x, k·y),            k = W'/W = H'/H
 *
 * Holds ONLY inside R-S4-conforming compositions; undefined for aspect-
 * mismatched inputs by design. No pixels, no rasterization, no fit policy.
 */

import type {
  MappingRecord,
  PaintedLandmark,
  ResourceLocation,
} from "./types.ts";
import type { Dims } from "./aspect.ts";
import { uniformScalePainted, uniformScaleReplacement } from "./aspect.ts";

export interface TargetRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LandmarkInput {
  x: number;
  y: number;
  /** Optional radius (a length scales by the same uniform factor). */
  r?: number;
}

/** Uniform scale of a conforming painted composition. */
export function paintedScale(target: TargetRect, body: Dims): number {
  return uniformScalePainted({ w: target.w, h: target.h }, body);
}

/**
 * Emit the predicted mapping table for sampled landmarks of a CONFORMING
 * painted composition.
 */
export function predictPaintedLandmarks(
  target: TargetRect,
  body: Dims,
  landmarks: LandmarkInput[],
): { k: number; landmarks: PaintedLandmark[] } {
  const k = paintedScale(target, body);
  return {
    k,
    landmarks: landmarks.map((l) => ({
      u: l.x,
      v: l.y,
      x: target.x + k * l.x,
      y: target.y + k * l.y,
    })),
  };
}

/** Emit the replacement-form mapping record for a CONFORMING replacement. */
export function replacementMapping(
  original: Dims,
  replacement: Dims,
  landmarks: LandmarkInput[] = [],
  location: ResourceLocation = {},
): MappingRecord {
  const k = uniformScaleReplacement(original, replacement);
  return {
    requirement: "R-S5",
    form: "replacement",
    k,
    location,
    ...(landmarks.length > 0
      ? {
          landmarks: landmarks.map((l) => ({
            u: l.x,
            v: l.y,
            x: k * l.x,
            y: k * l.y,
          })),
        }
      : {}),
  };
}

/** Scale a radius by the uniform factor (circle in the worked examples). */
export function scaleRadius(r: number, k: number): number {
  return r * k;
}

/** Map one landmark point through a conforming painted composition. */
export function mapPaintedPoint(
  target: TargetRect,
  k: number,
  p: { x: number; y: number },
): { x: number; y: number } {
  return { x: target.x + k * p.x, y: target.y + k * p.y };
}
