/**
 * Renderer A — Experiment E14 resolution.
 *
 * Resolves Model A (Canvas + direct SVG painting), Model B (nested Overlay
 * Canvas painting, IIIF 4.0 DRAFT semantics), and Model C (W3C Web Annotation,
 * video target) into the shared E14 semantic record, using Renderer A's OWN
 * interpretation rules (src/reference/lib/*). Nothing is imported from
 * src/blind or src/native.
 *
 * Rendering conventions (documented per overlay as rules):
 *   - spatial fragment => destination region (region-as-destination);
 *   - SVG body with a viewBox is fitted into the region per
 *     preserveAspectRatio (default xMidYMid meet); Renderer A synthesizes a
 *     viewBox from width/height when the body has none (existing behavior);
 *   - Model B: the inner Canvas is scaled to fill the targeted region
 *     ("scaled to fit that region", IIIF 4.0 draft, Use Case 6), then the
 *     inner SVG is placed within the inner Canvas;
 *   - Model C: spatial frame = target video intrinsic dimensions.
 */

import type {
  E14Manifest,
  E14Model,
  E14Overlay,
  E14Placement,
  E14SvgAttrs,
  Rect,
  SvgBox,
} from "../../e14/types.ts";
import { asArray } from "./asArray.ts";
import {
  motivationIsPainting,
  isSvgBody,
  isVideoBody,
  parseTarget,
  mergeFragments,
} from "./iiif.ts";
import { temporalWindow } from "./timing.ts";
import { readSvgRootAttrs } from "./svg.ts";

export interface E14Fetchers {
  fetchSvg: (url: string) => Promise<string>;
  fetchManifest: (url: string) => Promise<any>;
}

export interface E14ResolveOptions {
  /** Spatial frame for Model C (target media intrinsic dimensions). */
  videoWidth?: number;
  videoHeight?: number;
  /** Model B nested-canvas fill mode: "fill" (non-uniform) or "contain". */
  nestedFit?: "fill" | "contain";
}

const DEFAULT_VIDEO_W = 1920;
const DEFAULT_VIDEO_H = 1080;

function abs(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

/** IIIF serializes partOf as an array; W3C-flavoured fixtures may use an object. */
function firstPartOfId(body: any): string | undefined {
  const p = body?.partOf;
  if (Array.isArray(p)) return p[0]?.id;
  return p?.id;
}

export function detectModel(manifest: any): E14Model {
  const type = String(manifest?.type ?? "");
  if (type === "AnnotationCollection" || type === "Annotation") return "C";
  const canvas = asArray<any>(manifest?.items).find((i) => i?.type === "Canvas");
  if (!canvas) return "A";
  const pages = asArray<any>(canvas.items).filter((i) => i?.type === "AnnotationPage");
  const annotations = pages.flatMap((p) => asArray<any>(p.items));
  for (const ann of annotations) {
    if (!motivationIsPainting(ann)) continue;
    for (const body of asArray<any>(ann.body)) {
      if (body && body.type === "Canvas") return "B";
    }
  }
  return "A";
}

export function parseSpatialRect(
  spatial: { x: number; y: number; w: number; h: number } | undefined,
  canvasWidth: number,
  canvasHeight: number,
): Rect {
  return spatial
    ? { x: spatial.x, y: spatial.y, w: spatial.w, h: spatial.h }
    : { x: 0, y: 0, w: canvasWidth, h: canvasHeight };
}

/**
 * Renderer A's own placement math. When the body has no viewBox, Renderer A
 * synthesizes one from width/height (falling back to the region) — the
 * documented existing behavior (see docs/ambiguities.md §1).
 */
export function refPlacement(viewport: Rect, attrs: E14SvgAttrs, synthesizeNoViewBox = true): E14Placement {
  const hasViewBox = !!attrs.viewBox;
  const viewBox: SvgBox = attrs.viewBox ?? {
    minX: 0,
    minY: 0,
    w: attrs.width ?? viewport.w,
    h: attrs.height ?? viewport.h,
  };
  const par = attrs.preserveAspectRatio ?? "xMidYMid meet";

  if (!hasViewBox && !synthesizeNoViewBox) {
    return {
      mode: "no-viewBox-1to1",
      viewport,
      scale: 1,
      translation: { x: viewport.x, y: viewport.y },
    };
  }

  if (par === "none") {
    const sx = viewport.w / viewBox.w;
    const sy = viewport.h / viewBox.h;
    return {
      mode: "viewBox-none",
      viewport,
      scale: null,
      translation: { x: viewport.x - viewBox.minX * sx, y: viewport.y - viewBox.minY * sy },
    };
  }

  const meet = !/slice/.test(par);
  const sx = viewport.w / viewBox.w;
  const sy = viewport.h / viewBox.h;
  const scale = meet ? Math.min(sx, sy) : Math.max(sx, sy);
  const usedW = viewBox.w * scale;
  const usedH = viewBox.h * scale;
  const ox = /xMax/.test(par) ? viewport.w - usedW : /xMid/.test(par) ? (viewport.w - usedW) / 2 : 0;
  const oy = /yMax/i.test(par) ? viewport.h - usedH : /yMid/i.test(par) ? (viewport.h - usedH) / 2 : 0;
  return {
    mode: (meet ? "viewBox-meet" : "viewBox-slice") as E14Placement["mode"],
    viewport,
    scale,
    translation: {
      x: viewport.x + ox - viewBox.minX * scale,
      y: viewport.y + oy - viewBox.minY * scale,
    },
  };
}

function securityOf(kind: string): E14Overlay["security"] {
  if (kind === "svg") return undefined; // filled by caller when SVG text is known
  return { level: "safe", blocking: [], decision: "render" };
}

export async function resolveE14Manifest(
  manifest: any,
  manifestUrl: string,
  fetchers: E14Fetchers,
  options: E14ResolveOptions = {},
): Promise<E14Manifest> {
  const model = detectModel(manifest);
  const videoW = options.videoWidth ?? DEFAULT_VIDEO_W;
  const videoH = options.videoHeight ?? DEFAULT_VIDEO_H;

  if (model === "C") return resolveModelC(manifest, manifestUrl, fetchers, videoW, videoH);
  return resolveIiif(manifest, manifestUrl, fetchers, model, options);
}

// ---------------------------------------------------------------------------
// Models A / B (IIIF Manifest)
// ---------------------------------------------------------------------------
async function resolveIiif(
  manifest: any,
  manifestUrl: string,
  fetchers: E14Fetchers,
  model: E14Model,
  options: E14ResolveOptions,
): Promise<E14Manifest> {
  const canvasNode = asArray<any>(manifest?.items).find((i) => i?.type === "Canvas");
  if (!canvasNode) throw new Error("no Canvas in manifest");
  const canvas = {
    id: String(canvasNode.id ?? ""),
    width: typeof canvasNode.width === "number" ? canvasNode.width : 0,
    height: typeof canvasNode.height === "number" ? canvasNode.height : 0,
    duration: typeof canvasNode.duration === "number" ? canvasNode.duration : null,
  };

  const pages = asArray<any>(canvasNode.items).filter((i) => i?.type === "AnnotationPage");
  const annotations = pages.flatMap((p) => asArray<any>(p.items));

  let videoUrl: string | null = null;
  const overlays: E14Overlay[] = [];
  let paintIndex = 0;

  for (const ann of annotations) {
    if (!motivationIsPainting(ann)) continue;
    const target = parseTarget(ann.target, canvas.width, canvas.height);
    if (!target) continue;

    for (const body of asArray<any>(ann.body)) {
      if (!body) continue;

      if (isVideoBody(body)) {
        if (!videoUrl && body.id) videoUrl = abs(String(body.id), manifestUrl);
        continue;
      }

      const fragment = mergeFragments(target.fragments);
      const window = temporalWindow(fragment.temporal, canvas.duration ?? Number.POSITIVE_INFINITY);
      const dest = parseSpatialRect(fragment.spatial, canvas.width, canvas.height);

      if (body.type === "Canvas") {
        const inner = await resolveNestedCanvas(body, manifestUrl, fetchers, dest, window, paintIndex, model, options);
        for (const ov of inner) overlays.push(ov);
        paintIndex += inner.length;
        continue;
      }

      if (isSvgBody(body)) {
        const svgUrl = abs(String(body.id), manifestUrl);
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(svgUrl);
        } catch {
          continue;
        }
        const attrs = readSvgRootAttrs(svgText);
        const placement = refPlacement(dest, attrs);
        const rules: E14Overlay["rules"] = [
          { rule: "Model A: painting SVG directly into Canvas", provenance: model === "B" ? "NORMATIVE" : "NORMATIVE" },
          { rule: `temporal window [${window.start},${window.end})`, provenance: "NORMATIVE" },
          { rule: "spatial fragment => destination region (region-as-destination)", provenance: "DERIVED" },
          {
            rule: attrs.viewBox
              ? `SVG viewBox fitted into region (${attrs.preserveAspectRatio ?? "xMidYMid meet"})`
              : "SVG without viewBox: Renderer A synthesizes viewBox from width/height (reference convention)",
            provenance: attrs.viewBox ? "NORMATIVE" : "CONVENTION",
          },
        ];
        overlays.push({
          id: String(ann.id ?? body.id ?? `anno-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: attrs,
          placement,
          security: { level: "safe", blocking: [], decision: "render" },
          rules,
          kind: "svg",
          svgText,
        });
        continue;
      }

      if (body.type === "TextualBody") {
        overlays.push({
          id: String(ann.id ?? `text-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: {},
          placement: {
            mode: "no-viewBox-1to1",
            viewport: dest,
            scale: 1,
            translation: { x: dest.x, y: dest.y },
          },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [
            { rule: "TextualBody painting: rendered as text anchored at region origin", provenance: "CONVENTION" },
          ],
          kind: "textual",
        });
        continue;
      }

      // Raster (PNG) control body.
      if (body.format && /^image\/(?!svg)/.test(String(body.format))) {
        const placement: E14Placement = {
          mode: "image-contain",
          viewport: dest,
          scale: null,
          translation: { x: dest.x, y: dest.y },
        };
        overlays.push({
          id: String(ann.id ?? body.id ?? `img-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: {},
          placement,
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [
            { rule: "Raster image painted into region (aspect-preserving contain)", provenance: "CONVENTION" },
          ],
          kind: "png",
        });
      }
    }
  }

  return { manifestId: manifestUrl, model, canvas, videoUrl, overlays };
}

/**
 * Resolve a nested Overlay Canvas (Model B) into outer-space overlays.
 * The inner Canvas's own painting annotations are resolved in inner space,
 * then mapped linearly into the outer destination region.
 */
async function resolveNestedCanvas(
  body: any,
  manifestUrl: string,
  fetchers: E14Fetchers,
  outerDest: Rect,
  window: { start: number; end: number },
  startZ: number,
  model: E14Model,
  options: E14ResolveOptions,
): Promise<E14Overlay[]> {
  const innerManifestUrl = abs(String(firstPartOfId(body) ?? body.id), manifestUrl);
  const innerManifest = await fetchers.fetchManifest(innerManifestUrl);
  const innerCanvas = asArray<any>(innerManifest?.items).find((i) => i?.type === "Canvas" && i.id === body.id)
    ?? asArray<any>(innerManifest?.items).find((i) => i?.type === "Canvas");
  if (!innerCanvas) throw new Error("nested Canvas not found");

  const innerW = typeof innerCanvas.width === "number" ? innerCanvas.width : 0;
  const innerH = typeof innerCanvas.height === "number" ? innerCanvas.height : 0;

  // Inner canvas paintings, resolved like a Model A canvas.
  const innerPages = asArray<any>(innerCanvas.items).filter((i) => i?.type === "AnnotationPage");
  const innerAnnotations = innerPages.flatMap((p) => asArray<any>(p.items));

  const fit = options.nestedFit ?? "fill";
  // Model B: inner Canvas -> outer region mapping. "fill" = non-uniform
  // stretch (IIIF 4.0 draft: "scaled to fit that region"); "contain" keeps
  // aspect (letterboxed). Both coincide when aspects match.
  const sx = outerDest.w / innerW;
  const sy = outerDest.h / innerH;
  const nestedScaleX = fit === "fill" ? sx : Math.min(sx, sy);
  const nestedScaleY = fit === "fill" ? sy : Math.min(sx, sy);
  const ox = fit === "fill" ? 0 : (outerDest.w - innerW * nestedScaleX) / 2;
  const oy = fit === "fill" ? 0 : (outerDest.h - innerH * nestedScaleY) / 2;

  const out: E14Overlay[] = [];
  let z = startZ;
  for (const ann of innerAnnotations) {
    if (!motivationIsPainting(ann)) continue;
    const target = parseTarget(ann.target, innerW, innerH);
    if (!target) continue;
    for (const innerBody of asArray<any>(ann.body)) {
      if (!innerBody || !isSvgBody(innerBody)) continue;
      const fragment = mergeFragments(target.fragments);
      const innerDest = parseSpatialRect(fragment.spatial, innerW, innerH);
      let svgText = "";
      try {
        svgText = await fetchers.fetchSvg(abs(String(innerBody.id), manifestUrl));
      } catch {
        continue;
      }
      const attrs = readSvgRootAttrs(svgText);
      const innerPlacement = refPlacement(innerDest, attrs);

      const outerDest2: Rect = {
        x: outerDest.x + ox + innerDest.x * nestedScaleX,
        y: outerDest.y + oy + innerDest.y * nestedScaleY,
        w: innerDest.w * nestedScaleX,
        h: innerDest.h * nestedScaleY,
      };

      out.push({
        id: String(ann.id ?? innerBody.id ?? `nested-${z}`),
        model,
        startTime: window.start,
        endTime: window.end,
        zIndex: z++,
        destination: outerDest2,
        svgAttrs: attrs,
        placement: {
          mode: "nested-canvas",
          viewport: outerDest2,
          scale: null,
          translation: { x: outerDest2.x, y: outerDest2.y },
          nested: {
            innerWidth: innerW,
            innerHeight: innerH,
            scaleX: nestedScaleX,
            scaleY: nestedScaleY,
            offsetX: outerDest.x + ox,
            offsetY: outerDest.y + oy,
          },
        },
        inner: { destination: innerDest, placement: innerPlacement },
        security: { level: "safe", blocking: [], decision: "render" },
        rules: [
          { rule: "Model B: nested Canvas painted as Content Resource (IIIF 4.0 DRAFT)", provenance: "NORMATIVE" },
          { rule: `inner Canvas ${innerW}x${innerH} scaled into outer region (${fit})`, provenance: fit === "fill" ? "DERIVED" : "OPEN" },
          { rule: "temporal window propagates from the outer painting annotation", provenance: "DERIVED" },
        ],
        kind: "svg",
        svgText,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Model C (Web Annotation)
// ---------------------------------------------------------------------------
async function resolveModelC(
  manifest: any,
  manifestUrl: string,
  fetchers: E14Fetchers,
  videoW: number,
  videoH: number,
): Promise<E14Manifest> {
  const annotations = asArray<any>(manifest?.items ?? manifest);
  let videoUrl: string | null = null;
  const overlays: E14Overlay[] = [];
  let z = 0;

  for (const ann of annotations) {
    if (!ann || ann.type !== "Annotation") continue;
    const target = parseTarget(ann.target, videoW, videoH);
    if (!target) continue;
    if (!videoUrl && /^video\//.test(String(ann.body?.format ?? ""))) {
      videoUrl = String(ann.body?.id ?? ann.body);
      continue;
    }
    if (!videoUrl && /\.mp4$/i.test(target.source)) videoUrl = target.source;

    for (const body of asArray<any>(ann.body)) {
      if (!body || typeof body !== "object") continue;
      if (isVideoBody(body)) {
        if (!videoUrl && body.id) videoUrl = String(body.id);
        continue;
      }
      const fragment = mergeFragments(target.fragments);
      const window = temporalWindow(fragment.temporal, Number.POSITIVE_INFINITY);
      const dest = parseSpatialRect(fragment.spatial, videoW, videoH);

      if (isSvgBody(body)) {
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(abs(String(body.id), manifestUrl));
        } catch {
          continue;
        }
        const attrs = readSvgRootAttrs(svgText);
        overlays.push({
          id: String(ann.id ?? body.id ?? `c-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: attrs,
          placement: refPlacement(dest, attrs),
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [
            { rule: "Model C: Web Annotation body+target, no IIIF painting semantics", provenance: "NORMATIVE" },
            { rule: "spatial frame = target video intrinsic dimensions (consumer must probe)", provenance: "DERIVED" },
            { rule: "z-order = annotation encounter order (application convention)", provenance: "CONVENTION" },
            {
              rule: attrs.viewBox
                ? `SVG viewBox fitted into region (${attrs.preserveAspectRatio ?? "xMidYMid meet"})`
                : "SVG without viewBox: Renderer A synthesizes viewBox from width/height",
              provenance: attrs.viewBox ? "NORMATIVE" : "CONVENTION",
            },
          ],
          kind: "svg",
          svgText,
        });
      } else if (body.type === "TextualBody") {
        overlays.push({
          id: String(ann.id ?? `c-text-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "no-viewBox-1to1", viewport: dest, scale: 1, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "TextualBody: text anchored at region origin (convention)", provenance: "CONVENTION" }],
          kind: "textual",
        });
      } else if (body.format && /^image\/(?!svg)/.test(String(body.format))) {
        overlays.push({
          id: String(ann.id ?? body.id ?? `c-img-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "image-contain", viewport: dest, scale: null, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "Raster image painted into region (contain)", provenance: "CONVENTION" }],
          kind: "png",
        });
      }
    }
  }

  return {
    manifestId: manifestUrl,
    model: "C",
    canvas: { id: "urn:video", width: videoW, height: videoH, duration: null },
    videoUrl,
    overlays,
  };
}