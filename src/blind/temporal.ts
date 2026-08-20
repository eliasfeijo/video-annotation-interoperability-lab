/**
 * Blind Renderer — temporal resolution.
 *
 * Applies Media Fragments temporal semantics to a Canvas duration:
 *   - `t=s,e`      => [s, e)          (half-open, NORMATIVE MF §4.2.1)
 *   - `t=s`        => [s, +inf)
 *   - `t=,e`       => [0, e)
 *   - none         => [0, canvasDuration) (or +inf if duration unknown)
 *
 * Provenance: [NORMATIVE] Media Fragments 4.2.1 / 6.1.1; [DERIVED] for the
 * no-fragment => whole-Canvas default (IIIF Canvas duration defines the extent).
 */

export interface TimeWindow {
  start: number;
  end: number;
}

export function resolveWindow(
  temporal: { start: number; end?: number } | undefined,
  canvasDuration: number | null,
): TimeWindow {
  if (!temporal) {
    return {
      start: 0,
      end:
        canvasDuration !== null && canvasDuration > 0
          ? canvasDuration
          : Number.POSITIVE_INFINITY,
    };
  }
  const start = temporal.start;
  const end = temporal.end ?? Number.POSITIVE_INFINITY;
  return { start, end };
}

/** Half-open visibility predicate: active at t iff start <= t < end. */
export function isActive(window: TimeWindow, t: number): boolean {
  return t >= window.start && t < window.end;
}