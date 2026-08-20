/**
 * Blind Renderer — manifest parser.
 *
 * Walks a IIIF Presentation manifest and extracts the semantic inputs the
 * resolver needs, following the interpretation packet:
 *   - Canvas width/height/duration                         [NORMATIVE IIIF]
 *   - painting annotations from all AnnotationPages        [NORMATIVE IIIF]
 *   - target source + FragmentSelector(s)                  [NORMATIVE W3C/W3C+IIIF]
 *   - bodies (Video vs SVG Image)                          [NORMATIVE IIIF/W3C]
 */

import type {
  MediaFragment,
  SpatialFragment,
  TemporalFragment,
} from "./types.ts";
import { parseFragmentValue } from "./selectors.ts";

export interface ParsedTarget {
  /** Canvas URI (the source). */
  source: string;
  /** Media fragments extracted from FragmentSelector values. */
  fragments: MediaFragment[];
}

export interface ParsedBody {
  /** Body URL for SVG bodies. */
  url: string;
  isSvg: boolean;
  isVideo: boolean;
}

export interface PaintingAnnotationInput {
  id: string;
  annotation: any;
  target: ParsedTarget | null;
  bodies: ParsedBody[];
}

const CANVAS_TYPE = "Canvas";
const PAGE_TYPE = "AnnotationPage";

function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

export function findCanvas(manifest: any): any | null {
  const items: any[] = asArray(manifest?.items);
  return items.find((i) => i?.type === CANVAS_TYPE) ?? null;
}

export function isSvgBody(body: any): boolean {
  const format = String(body?.format ?? "");
  const id = String(body?.id ?? "");
  return (
    format === "image/svg+xml" || /\.svg$/i.test(id) || /\.svg\?/i.test(id)
  );
}

export function isVideoBody(body: any): boolean {
  const type = String(body?.type ?? "");
  const format = String(body?.format ?? "");
  return (
    type === "Video" ||
    type === "Audio" ||
    /^video\//.test(format) ||
    /^audio\//.test(format)
  );
}

/** Resolve the target to a source URI + FragmentSelector media fragments. */
export function parseTarget(
  target: any,
  canvasWidth: number,
  canvasHeight: number,
): ParsedTarget | null {
  if (typeof target === "string") {
    return { source: target, fragments: [] };
  }
  if (target && typeof target === "object") {
    const source =
      typeof target.source === "string"
        ? target.source
        : typeof target.source?.id === "string"
          ? target.source.id
          : "";
    if (!source) return null;
    const fragments: MediaFragment[] = [];
    for (const sel of asArray<any>(target.selector)) {
      if (sel?.type === "FragmentSelector" && typeof sel.value === "string") {
        fragments.push(parseFragmentValue(sel.value, canvasWidth, canvasHeight));
      }
    }
    return { source, fragments };
  }
  return null;
}

/**
 * Merge fragments from possibly-multiple FragmentSelectors. Per W3C Web
 * Annotation §4.2, multiple selectors SHOULD select the same content; a
 * consumer "MUST pick one of the described segments, if they are different."
 * This implementation takes the first selector that yields each dimension.
 */
export function mergeFragments(
  fragments: MediaFragment[],
): { temporal?: TemporalFragment; spatial?: SpatialFragment } {
  const merged: { temporal?: TemporalFragment; spatial?: SpatialFragment } = {};
  for (const f of fragments) {
    if (f.temporal && !merged.temporal) merged.temporal = f.temporal;
    if (f.spatial && !merged.spatial) merged.spatial = f.spatial;
  }
  return merged;
}

/** Resolve all painting annotation inputs from a Canvas node. */
export function collectPaintingInputs(
  canvas: any,
  canvasWidth: number,
  canvasHeight: number,
): PaintingAnnotationInput[] {
  const pages: any[] = asArray(canvas?.items).filter(
    (i) => i?.type === PAGE_TYPE,
  );
  const inputs: PaintingAnnotationInput[] = [];
  for (const page of pages) {
    for (const ann of asArray<any>(page?.items)) {
      const id = String(ann?.id ?? "");
      const target = parseTarget(ann?.target, canvasWidth, canvasHeight);
      const bodies: ParsedBody[] = [];
      for (const body of asArray<any>(ann?.body)) {
        if (!body || typeof body !== "object") continue;
        const isSvg = isSvgBody(body);
        const isVideo = isVideoBody(body);
        if ((isSvg || isVideo) && typeof body.id === "string") {
          bodies.push({ url: body.id, isSvg, isVideo });
        }
      }
      inputs.push({ id, annotation: ann, target, bodies });
    }
  }
  return inputs;
}