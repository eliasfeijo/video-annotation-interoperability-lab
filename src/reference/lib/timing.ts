import type { ResolvedOverlay, TemporalFragment } from "./types.ts";

/**
 * Visibility rule tested in this experiment.
 *
 *   - no temporal fragment -> active over the whole Canvas duration
 *   - `t=start,end`        -> active on [start, end)   (start inclusive, end exclusive)
 *   - `t=start`            -> active on [start, +inf)
 *   - `t=,end`             -> active on [0, end)
 *
 * The half-open interval avoids double-counting at boundaries and gives a
 * deterministic, single-frame-precision answer for any real-valued t.
 */
export function temporalWindow(
  temporal: TemporalFragment | undefined,
  canvasDuration: number,
): { start: number; end: number } {
  if (!temporal) return { start: 0, end: canvasDuration > 0 ? canvasDuration : Number.POSITIVE_INFINITY };
  const start = temporal.start;
  const end = temporal.end ?? Number.POSITIVE_INFINITY;
  if (end < start) return { start, end: Number.POSITIVE_INFINITY };
  return { start, end };
}

export function isActiveAt(overlay: Pick<ResolvedOverlay, "startTime" | "endTime">, t: number): boolean {
  return t >= overlay.startTime && t < overlay.endTime;
}

export function activeAt(
  overlays: ResolvedOverlay[],
  t: number,
): ResolvedOverlay[] {
  return overlays.filter((o) => isActiveAt(o, t));
}