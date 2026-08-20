/**
 * Blind Renderer — layer ordering (z-order).
 *
 * Collects painting annotations from all AnnotationPages in container-then-item
 * order and assigns an ascending integer zIndex in encounter order.
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

export interface Encounter {
  /** Annotation node from the manifest. */
  annotation: any;
  /** Position of the AnnotationPage in the Canvas items (0-based). */
  pageIndex: number;
  /** Position of the Annotation within its page (0-based). */
  itemIndex: number;
  /** Global encounter ordinal across pages (0-based). */
  ordinal: number;
}

/** Flatten painting annotations from a Canvas in encounter order. */
export function collectPaintingAnnotations(canvas: any): Encounter[] {
  const pages: any[] = Array.isArray(canvas?.items) ? canvas.items : [];
  const out: Encounter[] = [];
  let ordinal = 0;
  pages.forEach((page, pageIndex) => {
    const items: any[] = Array.isArray(page?.items) ? page.items : [];
    items.forEach((ann, itemIndex) => {
      out.push({ annotation: ann, pageIndex, itemIndex, ordinal: ordinal++ });
    });
  });
  return out;
}

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