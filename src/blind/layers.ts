/**
 * Blind Renderer — z-order provenance and painting-motivation test.
 *
 * The blind resolvers assign zIndex inline in encounter order while walking
 * AnnotationPages; this module carries the rule provenance for that
 * assignment.
 *
 * Provenance:
 *   - IIIF 3.0/4.0 AnnotationPage: "Clients should process the Annotation Pages
 *     and their items in the order given in the Canvas [Container]."  [NORMATIVE]
 *   - IIIF 4.0: annotations get "an ascending z-index from the first annotation
 *     encountered", "the last Annotation ... will display on top of any others".
 *                                                                     [NORMATIVE 4.0]
 *   - Under 3.0 (Mode A) z-order-from-order is [CONVENTION] (order is normative,
 *     z semantics are not); under 4.0 (Mode B) it is [NORMATIVE].
 */

import type { IiifMode, Provenance } from "./types.ts";

export function isPainting(annotation: any): boolean {
  const list = Array.isArray(annotation?.motivation)
    ? annotation.motivation
    : [annotation?.motivation];
  return (list ?? []).some(
    (m: unknown) =>
      typeof m === "string" &&
      (m === "painting" || m === "oa:painting" || /(^|:)painting$/.test(m)),
  );
}

export function zProvenance(mode: IiifMode): Provenance {
  return mode === "B" ? "NORMATIVE" : "CONVENTION";
}