import type {
  CanvasInfo,
  MediaFragment,
  ResolvedManifest,
  ResolvedOverlay,
} from "./types.ts";
import { parseFragmentValue } from "./selectors.ts";
import { temporalWindow } from "./timing.ts";
import { readSvgRootAttrs } from "./svg.ts";

function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

export function motivationIsPainting(annotation: any): boolean {
  const list = asArray<string>(annotation?.motivation);
  return list.some((m) => m === "painting" || m === "oa:painting" || /(^|:)painting$/.test(m));
}

export function isSvgBody(body: any): boolean {
  const format = String(body?.format ?? "");
  const id = String(body?.id ?? "");
  return format === "image/svg+xml" || /\.svg$/i.test(id) || /\.svg\?/i.test(id);
}

export function isVideoBody(body: any): boolean {
  const type = String(body?.type ?? "");
  const format = String(body?.format ?? "");
  return type === "Video" || type === "Audio" || /^video\//.test(format) || /^audio\//.test(format);
}

export interface ParsedTarget {
  source: string;
  fragments: MediaFragment[];
}

export function parseTarget(target: any, canvasWidth?: number, canvasHeight?: number): ParsedTarget | null {
  if (typeof target === "string") return { source: target, fragments: [] };
  if (target && typeof target === "object") {
    const source = typeof target.source === "string"
      ? target.source
      : String(target.source?.id ?? target.source ?? "");
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

export function mergeFragments(fragments: MediaFragment[]): MediaFragment {
  const merged: MediaFragment = {};
  for (const f of fragments) {
    if (f.temporal && !merged.temporal) merged.temporal = f.temporal;
    if (f.spatial && !merged.spatial) merged.spatial = f.spatial;
  }
  return merged;
}

function abs(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

export type SvgFetcher = (url: string) => Promise<string>;

/**
 * Renderer A: interpret a IIIF Presentation 3.0 manifest and lower it into the
 * renderer-agnostic `ResolvedOverlay[]`. This is the generic, non-experiment
 * specific path.
 */
export async function resolveManifest(
  manifest: any,
  manifestUrl: string,
  fetchSvg: SvgFetcher,
): Promise<ResolvedManifest> {
  const canvasNode = asArray<any>(manifest?.items).find((i) => i?.type === "Canvas");
  if (!canvasNode) throw new Error("no Canvas in manifest");

  const canvas: CanvasInfo = {
    id: String(canvasNode.id ?? ""),
    width: typeof canvasNode.width === "number" ? canvasNode.width : undefined,
    height: typeof canvasNode.height === "number" ? canvasNode.height : undefined,
    duration: typeof canvasNode.duration === "number" ? canvasNode.duration : undefined,
  };

  const pages = asArray<any>(canvasNode.items).filter((i) => i?.type === "AnnotationPage");
  const annotations = pages.flatMap((p) => asArray<any>(p.items));

  let videoUrl: string | null = null;
  const overlays: ResolvedOverlay[] = [];
  let paintIndex = 0;

  for (const ann of annotations) {
    if (!motivationIsPainting(ann)) {
      // Non-painting annotations are out of scope for rendering; record nothing.
      continue;
    }
    const target = parseTarget(ann.target, canvas.width, canvas.height);
    if (!target) continue;

    for (const body of asArray<any>(ann.body)) {
      if (!body) continue;
      if (isVideoBody(body)) {
        if (!videoUrl && body.id) {
          videoUrl = abs(String(body.id), manifestUrl);
        }
        continue;
      }
      if (!isSvgBody(body)) continue;

      const fragment = mergeFragments(target.fragments);
      const window = temporalWindow(fragment.temporal, canvas.duration ?? Number.POSITIVE_INFINITY);
      const spatial = fragment.spatial;
      const viewport = spatial
        ? { x: spatial.x, y: spatial.y, w: spatial.w, h: spatial.h }
        : {
            x: 0,
            y: 0,
            w: canvas.width ?? 0,
            h: canvas.height ?? 0,
          };

      const svgUrl = abs(String(body.id), manifestUrl);
      let svgText = "";
      try {
        svgText = await fetchSvg(svgUrl);
      } catch (err) {
        console.warn(`[rendererA] failed to load body ${svgUrl}`, err);
        continue;
      }

      overlays.push({
        id: String(ann.id ?? body.id ?? `anno-${paintIndex}`),
        startTime: window.start,
        endTime: window.end,
        // Z-order: position of this painting annotation within the page stack.
        // The base video painting precedes overlay annotations in the fixtures.
        zIndex: paintIndex++,
        svgText,
        svgAttrs: readSvgRootAttrs(svgText),
        viewport,
      });
    }
  }

  return { canvas, videoUrl, overlays };
}