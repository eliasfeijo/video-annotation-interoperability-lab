/**
 * Blind Renderer — temporal window resolution.
 *
 * Resolves a parsed Media Fragments temporal dimension against a Canvas
 * duration into a concrete visibility window:
 *   - `t=s,e`      => [s, e)          (half-open, NORMATIVE MF §4.2.1)
 *   - `t=s`        => [s, +inf)
 *   - `t=,e`       => [0, e)
 *   - none         => [0, canvasDuration) (or +inf if duration unknown)
 *
 * Provenance: [NORMATIVE] Media Fragments 4.2.1 / 6.1.1; [DERIVED] for the
 * no-fragment => whole-Canvas default (IIIF Canvas duration defines the extent).
 *
 * The half-open ACTIVITY PREDICATE itself (`isActive`) and the TimeWindow
 * shape are renderer-neutral primitives (src/primitives/temporal.ts); only
 * this defaulting policy remains consumer-local.
 */

import type { TimeWindow } from "../primitives/temporal.ts";

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
