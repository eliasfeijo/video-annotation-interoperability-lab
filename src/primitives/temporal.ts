/**
 * Renderer-neutral primitive — temporal visibility predicate.
 *
 * The half-open activity predicate of Media Fragments temporal semantics:
 * a window [start, end) contains t iff start <= t < end (MF §4.2.1, the
 * half-open interval adopted throughout this project).
 *
 * Policy-free: it decides nothing about parsing, invalid fragments, open
 * windows, or whole-Canvas defaults. Window RESOLUTION from parsed fragments
 * (defaulting, duration guards) deliberately stays with each consumer
 * (src/blind/temporal.ts resolveWindow, src/reference/lib/timing.ts
 * temporalWindow, src/native/resolver.ts windowOf); only the shared predicate
 * and its window shape live here.
 *
 * Provenance: [NORMATIVE] Media Fragments 1.0 §4.2.1 (half-open interval);
 * recorded as a three-consumer agreement point in docs/ambiguities.md.
 *
 * Governance: physical location does not establish semantic ownership; no
 * renderer is authoritative for this predicate.
 */

export interface TimeWindow {
  start: number;
  end: number;
}

/** Half-open visibility predicate: active at t iff start <= t < end. */
export function isActive(window: TimeWindow, t: number): boolean {
  return t >= window.start && t < window.end;
}
