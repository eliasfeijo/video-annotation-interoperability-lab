/**
 * Blind Renderer — Experiment E14 resolution.
 *
 * Resolves Model A (Canvas + direct SVG painting), Model B (nested Overlay
 * Canvas painting, IIIF 4.0 DRAFT), and Model C (W3C Web Annotation) into the
 * shared E14 record using ONLY the blind interpretation packet
 * (docs/blind-interpretation-rules.md, extended by the E14 packet in
 * research/e14-report.md) and the standards it cites. It never imports
 * src/reference/*.
 *
 * Placement uses the blind renderer's own math (src/blind/placement.ts),
 * which follows SVG-as-image semantics: no viewBox => 1:1 user units
 * (SVG 1.1 §7.3/§7.8); viewBox + preserveAspectRatio => fit (SVG 1.1 §7.7/§7.8).
 */

import type {
  E14Manifest,
  E14Model,
  E14Overlay,
  E14Placement,
  E14SvgAttrs,
  E14Security,
  Rect,
} from "../e14/types.ts";
import {
  findCanvas,
  parseTarget,
  mergeFragments,
  isSvgBody,
  isVideoBody,
  collectPaintingInputs,
} from "./parser.ts";
import { isPainting } from "./layers.ts";
import { resolveWindow } from "./temporal.ts";
import { readSvgRootAttrs } from "./svg-root.ts";
import { computePlacement } from "./placement.ts";
import { classifySvg } from "./sanitize.ts";

export interface BlindE14Fetchers {
  fetchSvg: (url: string) => Promise<string>;
  fetchManifest: (url: string) => Promise<any>;
}

export interface BlindE14Options {
  videoWidth?: number;
  videoHeight?: number;
  nestedFit?: "fill" | "contain";
}

const DEFAULT_VIDEO_W = 1920;
const DEFAULT_VIDEO_H = 1080;

function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function abs(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

/** Blind's own model detection (written independently of the reference). */
export function detectE14Model(manifest: any): E14Model {
  const type = String(manifest?.type ?? "");
  if (type === "AnnotationCollection" || type === "Annotation") return "C";
  const canvas = findCanvas(manifest);
  if (!canvas) return "A";
  for (const page of asArray<any>(canvas.items)) {
    for (const ann of asArray<any>(page?.items)) {
      for (const body of asArray<any>(ann?.body)) {
        if (body && typeof body === "object" && body.type === "Canvas") return "B";
      }
    }
  }
  return "A";
}

function toPlacement(p: ReturnType<typeof computePlacement>): E14Placement {
  return {
    mode: p.mode,
    viewport: p.viewport,
    scale: p.scale,
    translation: p.translation,
  };
}

function securityOf(svgText: string | null): E14Security {
  if (svgText === null) return { level: "safe", blocking: [], decision: "render" };
  const c = classifySvg(svgText);
  return {
    level: c.level,
    blocking: c.blocking,
    decision: c.level === "unsafe" ? "reject" : c.level === "unsupported" ? "sanitize" : "render",
  };
}

export async function resolveBlindE14Manifest(
  manifest: any,
  manifestUrl: string,
  fetchers: BlindE14Fetchers,
  options: BlindE14Options = {},
): Promise<E14Manifest> {
  const model = detectE14Model(manifest);
  const videoW = options.videoWidth ?? DEFAULT_VIDEO_W;
  const videoH = options.videoHeight ?? DEFAULT_VIDEO_H;

  if (model === "C") return resolveBlindC(manifest, manifestUrl, fetchers, videoW, videoH);
  return resolveBlindIiif(manifest, manifestUrl, fetchers, model, options);
}

// ---------------------------------------------------------------------------
// Models A / B
// ---------------------------------------------------------------------------
async function resolveBlindIiif(
  manifest: any,
  manifestUrl: string,
  fetchers: BlindE14Fetchers,
  model: E14Model,
  options: BlindE14Options,
): Promise<E14Manifest> {
  const canvasNode = findCanvas(manifest);
  if (!canvasNode) throw new Error("no Canvas in manifest");
  const canvas = {
    id: String(canvasNode.id ?? ""),
    width: typeof canvasNode.width === "number" ? canvasNode.width : 0,
    height: typeof canvasNode.height === "number" ? canvasNode.height : 0,
    duration: typeof canvasNode.duration === "number" ? canvasNode.duration : null,
  };

  const inputs = collectPaintingInputs(canvasNode, canvas.width, canvas.height);
  let videoUrl: string | null = null;
  const overlays: E14Overlay[] = [];
  let paintIndex = 0;

  for (const input of inputs) {
    if (!isPainting(input.annotation)) continue;
    const target = input.target;
    if (!target) continue;

    for (const body of input.bodies) {
      if (body.isVideo) {
        if (!videoUrl) videoUrl = body.url;
        continue;
      }
    }
    // Bodies that are not SVG/video (Canvas, TextualBody, PNG) need handling
    // beyond collectPaintingInputs, which only captures SVG/video. Walk the raw
    // annotation again for those.
    const fragment = mergeFragments(target.fragments);
    const window = resolveWindow(fragment.temporal, canvas.duration);
    const dest: Rect = fragment.spatial
      ? { x: fragment.spatial.x, y: fragment.spatial.y, w: fragment.spatial.w, h: fragment.spatial.h }
      : { x: 0, y: 0, w: canvas.width, h: canvas.height };

    for (const body of asArray<any>(input.annotation.body)) {
      if (!body || typeof body !== "object") continue;

      if (body.type === "Canvas") {
        const nested = await resolveBlindNested(body, manifestUrl, fetchers, dest, window, paintIndex, model, options);
        for (const ov of nested) overlays.push(ov);
        paintIndex += nested.length;
        continue;
      }

      if (isSvgBody(body)) {
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(abs(String(body.id), manifestUrl));
        } catch {
          continue;
        }
        const attrs = readSvgRootAttrs(svgText);
        const placement = toPlacement(computePlacement({ destination: dest, attrs }));
        const sec = securityOf(svgText);
        overlays.push({
          id: String(input.id || body.id || `blind-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: attrs,
          placement,
          security: sec,
          rules: [
            { rule: "Model A: painting SVG into Canvas (painting motivation)", provenance: "NORMATIVE" },
            { rule: "temporal window (half-open)", provenance: "NORMATIVE" },
            { rule: "spatial fragment => destination region", provenance: "DERIVED" },
            {
              rule: attrs.viewBox
                ? `SVG viewBox -> region (${attrs.preserveAspectRatio ?? "xMidYMid meet"})`
                : "no viewBox => 1:1 user units (SVG-as-image; preserveAspectRatio ignored)",
              provenance: attrs.viewBox ? "NORMATIVE" : "OPEN",
            },
            {
              rule: `security: ${sec.decision} (${sec.level})`,
              provenance: "CONVENTION",
            },
          ],
          kind: "svg",
          svgText,
        });
        continue;
      }

      if (body.type === "TextualBody") {
        overlays.push({
          id: String(input.id || `text-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "no-viewBox-1to1", viewport: dest, scale: 1, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "TextualBody: text at region origin (convention)", provenance: "CONVENTION" }],
          kind: "textual",
        });
        continue;
      }

      if (typeof body.format === "string" && /^image\/(?!svg)/.test(body.format)) {
        overlays.push({
          id: String(input.id || body.id || `img-${paintIndex}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: paintIndex++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "image-contain", viewport: dest, scale: null, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "Raster image into region (contain)", provenance: "CONVENTION" }],
          kind: "png",
        });
      }
    }
  }

  return { manifestId: manifestUrl, model, canvas, videoUrl, overlays };
}

async function resolveBlindNested(
  body: any,
  manifestUrl: string,
  fetchers: BlindE14Fetchers,
  outerDest: Rect,
  window: { start: number; end: number },
  startZ: number,
  model: E14Model,
  options: BlindE14Options,
): Promise<E14Overlay[]> {
  // IIIF serializes partOf as an array; W3C-flavoured fixtures may use an object.
  const partOf = Array.isArray(body.partOf) ? body.partOf[0]?.id : body.partOf?.id;
  const innerManifestUrl = abs(String(partOf ?? body.id), manifestUrl);
  const innerManifest = await fetchers.fetchManifest(innerManifestUrl);
  const innerCanvas = findCanvas(innerManifest);
  if (!innerCanvas) throw new Error("nested Canvas not found");

  const innerW = typeof innerCanvas.width === "number" ? innerCanvas.width : 0;
  const innerH = typeof innerCanvas.height === "number" ? innerCanvas.height : 0;
  const fit = options.nestedFit ?? "fill";
  const sx = outerDest.w / innerW;
  const sy = outerDest.h / innerH;
  const nsx = fit === "fill" ? sx : Math.min(sx, sy);
  const nsy = fit === "fill" ? sy : Math.min(sx, sy);
  const ox = fit === "fill" ? 0 : (outerDest.w - innerW * nsx) / 2;
  const oy = fit === "fill" ? 0 : (outerDest.h - innerH * nsy) / 2;

  const innerInputs = collectPaintingInputs(innerCanvas, innerW, innerH);
  const out: E14Overlay[] = [];
  let z = startZ;

  for (const input of innerInputs) {
    if (!isPainting(input.annotation)) continue;
    const target = input.target;
    if (!target) continue;
    const fragment = mergeFragments(target.fragments);
    const innerDest: Rect = fragment.spatial
      ? { x: fragment.spatial.x, y: fragment.spatial.y, w: fragment.spatial.w, h: fragment.spatial.h }
      : { x: 0, y: 0, w: innerW, h: innerH };

    for (const innerBody of input.bodies) {
      if (!innerBody.isSvg) continue;
      let svgText = "";
      try {
        svgText = await fetchers.fetchSvg(abs(innerBody.url, manifestUrl));
      } catch {
        continue;
      }
      const attrs = readSvgRootAttrs(svgText);
      const innerPlacement = toPlacement(computePlacement({ destination: innerDest, attrs }));
      const outerDest2: Rect = {
        x: outerDest.x + ox + innerDest.x * nsx,
        y: outerDest.y + oy + innerDest.y * nsy,
        w: innerDest.w * nsx,
        h: innerDest.h * nsy,
      };
      const sec = securityOf(svgText);
      out.push({
        id: String(input.id || `nested-${z}`),
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
            scaleX: nsx,
            scaleY: nsy,
            offsetX: outerDest.x + ox,
            offsetY: outerDest.y + oy,
          },
        },
        inner: { destination: innerDest, placement: innerPlacement },
        security: sec,
        rules: [
          { rule: "Model B: nested Canvas painted as Content Resource (IIIF 4.0 DRAFT)", provenance: "NORMATIVE" },
          { rule: `inner Canvas scaled into outer region (${fit})`, provenance: fit === "fill" ? "DERIVED" : "OPEN" },
          { rule: "temporal window from outer painting", provenance: "DERIVED" },
        ],
        kind: "svg",
        svgText,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Model C
// ---------------------------------------------------------------------------
async function resolveBlindC(
  manifest: any,
  manifestUrl: string,
  fetchers: BlindE14Fetchers,
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
    if (/\.mp4$/i.test(target.source)) videoUrl = target.source;
    const fragment = mergeFragments(target.fragments);
    const window = resolveWindow(fragment.temporal, null);
    const dest: Rect = fragment.spatial
      ? { x: fragment.spatial.x, y: fragment.spatial.y, w: fragment.spatial.w, h: fragment.spatial.h }
      : { x: 0, y: 0, w: videoW, h: videoH };

    for (const body of asArray<any>(ann.body)) {
      if (!body || typeof body !== "object") continue;
      if (isVideoBody(body)) {
        if (!videoUrl && body.id) videoUrl = String(body.id);
        continue;
      }
      if (isSvgBody(body)) {
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(abs(String(body.id), manifestUrl));
        } catch {
          continue;
        }
        const attrs = readSvgRootAttrs(svgText);
        const placement = toPlacement(computePlacement({ destination: dest, attrs }));
        const sec = securityOf(svgText);
        overlays.push({
          id: String(ann.id || body.id || `c-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: attrs,
          placement,
          security: sec,
          rules: [
            { rule: "Model C: Web Annotation (body+target), no painting motivation defined", provenance: "NORMATIVE" },
            { rule: "spatial frame = target video intrinsic dims (DERIVED; consumer must probe)", provenance: "DERIVED" },
            { rule: "z-order = annotation order (convention)", provenance: "CONVENTION" },
            {
              rule: attrs.viewBox
                ? `SVG viewBox -> region (${attrs.preserveAspectRatio ?? "xMidYMid meet"})`
                : "no viewBox => 1:1 user units (SVG-as-image)",
              provenance: attrs.viewBox ? "NORMATIVE" : "OPEN",
            },
          ],
          kind: "svg",
          svgText,
        });
      } else if (body.type === "TextualBody") {
        overlays.push({
          id: String(ann.id || `c-text-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "no-viewBox-1to1", viewport: dest, scale: 1, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "TextualBody at region origin (convention)", provenance: "CONVENTION" }],
          kind: "textual",
        });
      } else if (typeof body.format === "string" && /^image\/(?!svg)/.test(body.format)) {
        overlays.push({
          id: String(ann.id || body.id || `c-img-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "image-contain", viewport: dest, scale: null, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "Raster image into region (contain)", provenance: "CONVENTION" }],
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