/**
 * Browser-Native Renderer — Experiment E14 resolution.
 *
 * An independent, deliberately simple renderer written from the E14
 * interpretation packet (research/e14-report.md) and the standards it cites.
 * Its distinguishing feature is that the DOM stage renders SVG bodies through
 * the browser's NATIVE SVG-as-image pipeline (`<img src="…svg">`), which is the
 * semantics IIIF "Image Content Resource" implies for an `image/svg+xml` body.
 *
 * The resolver here computes the *predicted* placement the browser will apply;
 * the browser test (NativeStage + screenshots) verifies that prediction.
 *
 * Interpretation (all recorded per-overlay):
 *   - <img> box = destination region: SVG 1.1 §7.2 (CSS positioning on the
 *     referencing element establishes the viewport width/height).
 *   - viewBox present  => preserveAspectRatio maps user space into the box
 *     (SVG 1.1 §7.7 / §7.8).
 *   - viewBox absent   => preserveAspectRatio is ignored and user units map 1:1
 *     into the box (SVG 1.1 §7.3 / §7.8 / §7.12).
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

export interface NativeFetchers {
  fetchSvg: (url: string) => Promise<string>;
  fetchManifest: (url: string) => Promise<any>;
}

export interface NativeOptions {
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

// ---------------------------------------------------------------------------
// Model detection (native's own structural walk)
// ---------------------------------------------------------------------------
export function detectE14ModelNative(manifest: any): E14Model {
  const t = String(manifest?.type ?? "");
  if (t === "AnnotationCollection" || t === "Annotation") return "C";
  const canvas = asArray<any>(manifest?.items).find((i) => i?.type === "Canvas");
  if (!canvas) return "A";
  for (const page of asArray<any>(canvas.items)) {
    for (const ann of asArray<any>(page?.items)) {
      for (const b of asArray<any>(ann?.body)) {
        if (b && typeof b === "object" && b.type === "Canvas") return "B";
      }
    }
  }
  return "A";
}

// ---------------------------------------------------------------------------
// SVG root attrs (native's own parser)
// ---------------------------------------------------------------------------
function readAttrs(svgText: string): E14SvgAttrs {
  const attrs: E14SvgAttrs = {};
  const m = /<svg\b([^>]*)>/i.exec(svgText.trim());
  if (!m) return attrs;
  const tag = m[1]!;
  const re = /([A-Za-z_:][A-Za-z0-9_:.\-]*)\s*=\s*"([^"]*)"/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(tag)) !== null) {
    const name = x[1]!;
    const value = x[2]!;
    if (name === "viewBox") {
      const nums = value.trim().split(/[\s,]+/).map((s) => parseFloat(s)).filter((n) => !Number.isNaN(n));
      if (nums.length === 4 && nums[2]! > 0 && nums[3]! > 0) {
        attrs.viewBox = { minX: nums[0]!, minY: nums[1]!, w: nums[2]!, h: nums[3]! };
      }
    } else if (name === "preserveAspectRatio") {
      attrs.preserveAspectRatio = value;
    } else if (name === "width") {
      const n = parseFloat(value);
      if (Number.isFinite(n) && n >= 0) attrs.width = n;
    } else if (name === "height") {
      const n = parseFloat(value);
      if (Number.isFinite(n) && n >= 0) attrs.height = n;
    }
  }
  return attrs;
}

// ---------------------------------------------------------------------------
// Native placement (SVG-as-image semantics)
// ---------------------------------------------------------------------------
export function nativePlacement(dest: Rect, attrs: E14SvgAttrs): E14Placement {
  if (!attrs.viewBox) {
    return {
      mode: "no-viewBox-1to1",
      viewport: dest,
      scale: 1,
      translation: { x: dest.x, y: dest.y },
    };
  }
  const vb = attrs.viewBox;
  const par = attrs.preserveAspectRatio ?? "xMidYMid meet";
  if (par === "none") {
    const sx = dest.w / vb.w;
    const sy = dest.h / vb.h;
    return {
      mode: "viewBox-none",
      viewport: dest,
      scale: null,
      translation: { x: dest.x - vb.minX * sx, y: dest.y - vb.minY * sy },
    };
  }
  const meet = !/slice/.test(par);
  const sx = dest.w / vb.w;
  const sy = dest.h / vb.h;
  const scale = meet ? Math.min(sx, sy) : Math.max(sx, sy);
  const usedW = vb.w * scale;
  const usedH = vb.h * scale;
  const ox = /xMax/.test(par) ? dest.w - usedW : /xMid/.test(par) ? (dest.w - usedW) / 2 : 0;
  const oy = /yMax/i.test(par) ? dest.h - usedH : /yMid/i.test(par) ? (dest.h - usedH) / 2 : 0;
  return {
    mode: (meet ? "viewBox-meet" : "viewBox-slice") as E14Placement["mode"],
    viewport: dest,
    scale,
    translation: {
      x: dest.x + ox - vb.minX * scale,
      y: dest.y + oy - vb.minY * scale,
    },
  };
}

// ---------------------------------------------------------------------------
// Native security classification (independent, lightweight)
//
// The native renderer delegates rendering to the browser's SVG-as-image
// pipeline (`<img>`). Under that pipeline the platform's image-loading
// security model applies: scripts, external resources and interactive
// features are inert. So the native decision is always "render" and the
// classification is recorded for the report — the <img> sandbox is a browser
// behavior, NOT a manifest-expressible security policy.
// ---------------------------------------------------------------------------
export function nativeSecurity(svgText: string): E14Security {
  const has = (re: RegExp) => re.test(svgText);
  const blocking: string[] = [];
  if (has(/<script\b/i)) blocking.push("script");
  if (has(/<foreignObject\b/i)) blocking.push("foreignObject");
  if (has(/\son[a-z]+\s*=/i)) blocking.push("eventHandler");
  if (has(/(?:href|xlink:href)\s*=\s*"(?!data:image|\/|#)/i)) blocking.push("externalHref");
  const level = blocking.length > 0
    ? ("unsafe" as const)
    : has(/<(image|use|style|filter|animate\w*|set)\b/i)
      ? ("unsupported" as const)
      : ("safe" as const);
  return { level, blocking, decision: "render" };
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------
export async function resolveNativeManifest(
  manifest: any,
  manifestUrl: string,
  fetchers: NativeFetchers,
  options: NativeOptions = {},
): Promise<E14Manifest> {
  const model = detectE14ModelNative(manifest);
  const videoW = options.videoWidth ?? DEFAULT_VIDEO_W;
  const videoH = options.videoHeight ?? DEFAULT_VIDEO_H;

  if (model === "C") return resolveNativeC(manifest, manifestUrl, fetchers, videoW, videoH);
  return resolveNativeIiif(manifest, manifestUrl, fetchers, model, options);
}

async function resolveNativeIiif(
  manifest: any,
  manifestUrl: string,
  fetchers: NativeFetchers,
  model: E14Model,
  options: NativeOptions,
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
  let z = 0;

  const targetOf = (ann: any) => {
    const target = ann?.target;
    if (typeof target === "string") return { source: target, selectors: [] as any[] };
    if (target && typeof target === "object") {
      // W3C `source` or IIIF `id` (the Canvas object itself).
      return {
        source:
          typeof target.source === "string"
            ? target.source
            : String(target.source?.id ?? target.id ?? ""),
        selectors: asArray<any>(target.selector),
      };
    }
    return null;
  };

  const fragmentOf = (ann: any) => {
    const t = targetOf(ann);
    if (!t) return { temporal: undefined, spatial: undefined };
    let temporal: { start: number; end?: number } | undefined;
    let spatial: { x: number; y: number; w: number; h: number; percent: boolean } | undefined;
    for (const sel of t.selectors) {
      if (sel?.type !== "FragmentSelector" || typeof sel.value !== "string") continue;
      for (const pair of sel.value.split("&")) {
        const eq = pair.indexOf("=");
        if (eq === -1) continue;
        const name = pair.slice(0, eq).trim();
        const val: string = pair.slice(eq + 1).trim();
        if (name === "t") {
          const parts = val.replace(/^npt:/i, "").split(",");
          const start = parseFloat(parts[0]!);
          if (Number.isFinite(start)) {
            const end = parts.length > 1 && parts[1] !== "" ? parseFloat(parts[1]!) : undefined;
            if (end !== undefined && Number.isFinite(end) && end >= start) temporal = { start, end };
            else if (end === undefined) temporal = { start };
          }
        } else if (name === "xywh") {
          const unit = /^(pct|percent|pixel):/i.exec(val);
          let body = val;
          let percent = false;
          if (unit) {
            percent = unit[1]!.toLowerCase() === "pct" || unit[1]!.toLowerCase() === "percent";
            body = val.slice(unit[0].length);
          }
          const nums = body.split(",").map((s) => parseFloat(s));
          if (nums.length === 4 && nums.every((n) => Number.isFinite(n)) && nums[2]! > 0 && nums[3]! > 0) {
            let x = nums[0]!;
            let y = nums[1]!;
            let w = nums[2]!;
            let h = nums[3]!;
            if (percent) {
              x = (x / 100) * canvas.width;
              y = (y / 100) * canvas.height;
              w = (w / 100) * canvas.width;
              h = (h / 100) * canvas.height;
            }
            if (x < canvas.width && y < canvas.height) spatial = { x, y, w, h, percent };
          }
        }
      }
    }
    return { temporal, spatial };
  };

  const windowOf = (temporal: { start: number; end?: number } | undefined) => {
    if (!temporal) return { start: 0, end: canvas.duration ?? Number.POSITIVE_INFINITY };
    return { start: temporal.start, end: temporal.end ?? Number.POSITIVE_INFINITY };
  };

  for (const ann of annotations) {
    const motivation = asArray<string>(ann?.motivation);
    if (!motivation.some((m) => m === "painting" || m === "oa:painting" || /(^|:)painting$/.test(m))) continue;
    const frag = fragmentOf(ann);
    const window = windowOf(frag.temporal);
    const dest: Rect = frag.spatial
      ? { x: frag.spatial.x, y: frag.spatial.y, w: frag.spatial.w, h: frag.spatial.h }
      : { x: 0, y: 0, w: canvas.width, h: canvas.height };

    for (const body of asArray<any>(ann.body)) {
      if (!body || typeof body !== "object") continue;
      if (body.type === "Video" || /^video\//.test(String(body.format ?? ""))) {
        if (!videoUrl && body.id) videoUrl = abs(String(body.id), manifestUrl);
        continue;
      }
      if (body.type === "Canvas") {
        const nested = await resolveNativeNested(body, manifestUrl, fetchers, dest, window, z, model, options);
        for (const ov of nested) overlays.push(ov);
        z += nested.length;
        continue;
      }
      if (String(body.format ?? "") === "image/svg+xml" || /\.svg$/i.test(String(body.id ?? ""))) {
        const svgUrl = abs(String(body.id), manifestUrl);
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(svgUrl);
        } catch {
          continue;
        }
        const attrs = readAttrs(svgText);
        const sec = nativeSecurity(svgText);
        overlays.push({
          id: String(ann.id ?? body.id ?? `native-${z}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: attrs,
          placement: nativePlacement(dest, attrs),
          security: sec,
          resourceUrl: svgUrl,
          rules: [
            { rule: "Native renderer: SVG painted as <img> (SVG-as-image semantics)", provenance: "NORMATIVE" },
            { rule: "<img> box = destination region (viewport via CSS positioning, SVG §7.2)", provenance: "NORMATIVE" },
            {
              rule: attrs.viewBox
                ? `viewBox -> region per preserveAspectRatio (${attrs.preserveAspectRatio ?? "xMidYMid meet"})`
                : "no viewBox => 1:1 user units; preserveAspectRatio ignored (SVG §7.3/§7.8/§7.12)",
              provenance: attrs.viewBox ? "NORMATIVE" : "OPEN",
            },
            { rule: `classified ${sec.level}; rendered via <img> sandbox (platform behavior, not a manifest policy)`, provenance: "IMPLEMENTATION_GAP" },
          ],
          kind: "svg",
          svgText,
        });
      } else if (body.type === "TextualBody") {
        overlays.push({
          id: String(ann.id ?? `native-text-${z}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "no-viewBox-1to1", viewport: dest, scale: 1, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          rules: [{ rule: "TextualBody rendered as text at region origin", provenance: "CONVENTION" }],
          kind: "textual",
        });
      } else if (/^image\/(?!svg)/.test(String(body.format ?? ""))) {
        overlays.push({
          id: String(ann.id ?? body.id ?? `native-img-${z}`),
          model,
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "image-contain", viewport: dest, scale: null, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          resourceUrl: abs(String(body.id), manifestUrl),
          rules: [{ rule: "Raster image rendered as <img> with object-fit contain", provenance: "CONVENTION" }],
          kind: "png",
        });
      }
    }
  }

  return { manifestId: manifestUrl, model, canvas, videoUrl, overlays };
}

async function resolveNativeNested(
  body: any,
  manifestUrl: string,
  fetchers: NativeFetchers,
  outerDest: Rect,
  window: { start: number; end: number },
  startZ: number,
  model: E14Model,
  options: NativeOptions,
): Promise<E14Overlay[]> {
  // IIIF serializes partOf as an array; W3C-flavoured fixtures may use an object.
  const partOf = Array.isArray(body.partOf) ? body.partOf[0]?.id : body.partOf?.id;
  const innerManifestUrl = abs(String(partOf ?? body.id), manifestUrl);
  const innerManifest = await fetchers.fetchManifest(innerManifestUrl);
  const innerCanvas = asArray<any>(innerManifest?.items).find((i) => i?.type === "Canvas" && i.id === body.id)
    ?? asArray<any>(innerManifest?.items).find((i) => i?.type === "Canvas");
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

  const innerPages = asArray<any>(innerCanvas.items).filter((i) => i?.type === "AnnotationPage");
  const innerAnnotations = innerPages.flatMap((p) => asArray<any>(p.items));
  const out: E14Overlay[] = [];
  let z = startZ;

  for (const ann of innerAnnotations) {
    const motivation = asArray<string>(ann?.motivation);
    if (!motivation.some((m) => m === "painting" || /(^|:)painting$/.test(m))) continue;
    const target = ann?.target;
    let innerDest: Rect = { x: 0, y: 0, w: innerW, h: innerH };
    if (target && typeof target === "object") {
      for (const sel of asArray<any>(target.selector)) {
        if (sel?.type !== "FragmentSelector" || typeof sel.value !== "string") continue;
        const m = /xywh=(?:percent:)?([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+)/.exec(sel.value);
        if (m) innerDest = { x: parseFloat(m[1]!), y: parseFloat(m[2]!), w: parseFloat(m[3]!), h: parseFloat(m[4]!) };
      }
    }
    for (const innerBody of asArray<any>(ann.body)) {
      if (!innerBody || String(innerBody.format ?? "") !== "image/svg+xml") continue;
      let svgText = "";
      try {
        svgText = await fetchers.fetchSvg(abs(String(innerBody.id), manifestUrl));
      } catch {
        continue;
      }
      const attrs = readAttrs(svgText);
      const innerPlacement = nativePlacement(innerDest, attrs);
      const outerDest2: Rect = {
        x: outerDest.x + ox + innerDest.x * nsx,
        y: outerDest.y + oy + innerDest.y * nsy,
        w: innerDest.w * nsx,
        h: innerDest.h * nsy,
      };
      const sec = nativeSecurity(svgText);
      out.push({
        id: String(ann.id ?? `nested-${z}`),
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
        resourceUrl: abs(String(innerBody.id), manifestUrl),
        rules: [
          { rule: "Model B: nested Canvas as Content Resource (IIIF 4.0 DRAFT)", provenance: "NORMATIVE" },
          { rule: `inner Canvas scaled into region (${fit})`, provenance: fit === "fill" ? "DERIVED" : "OPEN" },
        ],
        kind: "svg",
        svgText,
      });
    }
  }
  return out;
}

async function resolveNativeC(
  manifest: any,
  manifestUrl: string,
  fetchers: NativeFetchers,
  videoW: number,
  videoH: number,
): Promise<E14Manifest> {
  const annotations = asArray<any>(manifest?.items ?? manifest);
  let videoUrl: string | null = null;
  const overlays: E14Overlay[] = [];
  let z = 0;

  for (const ann of annotations) {
    if (!ann || ann.type !== "Annotation") continue;
    const target = ann?.target;
    let source = "";
    const selectors: any[] = [];
    if (typeof target === "string") source = target;
    else if (target && typeof target === "object") {
      source =
        typeof target.source === "string"
          ? target.source
          : String(target.source?.id ?? target.id ?? "");
      selectors.push(...asArray<any>(target.selector));
    }
    if (/\.mp4$/i.test(source)) videoUrl = source;

    let temporal: { start: number; end?: number } | undefined;
    let spatial: { x: number; y: number; w: number; h: number } | undefined;
    for (const sel of selectors) {
      if (sel?.type !== "FragmentSelector" || typeof sel.value !== "string") continue;
      for (const pair of sel.value.split("&")) {
        const eq = pair.indexOf("=");
        if (eq === -1) continue;
        const name = pair.slice(0, eq).trim();
        const val: string = pair.slice(eq + 1).trim();
        if (name === "t") {
          const parts = val.replace(/^npt:/i, "").split(",");
          const s = parseFloat(parts[0]!);
          if (Number.isFinite(s)) {
            const e = parts.length > 1 && parts[1] !== "" ? parseFloat(parts[1]!) : undefined;
            if (e !== undefined && Number.isFinite(e) && e >= s) temporal = { start: s, end: e };
            else if (e === undefined) temporal = { start: s };
          }
        } else if (name === "xywh") {
          const unit = /^(pct|percent|pixel):/i.exec(val);
          let body = val;
          let percent = false;
          if (unit) {
            percent = unit[1]!.toLowerCase() === "pct" || unit[1]!.toLowerCase() === "percent";
            body = val.slice(unit[0].length);
          }
          const nums = body.split(",").map((s) => parseFloat(s));
          if (nums.length === 4 && nums.every((n) => Number.isFinite(n)) && nums[2]! > 0 && nums[3]! > 0) {
            let [x, y, w, h] = nums as [number, number, number, number];
            if (percent) {
              x = (x / 100) * videoW;
              y = (y / 100) * videoH;
              w = (w / 100) * videoW;
              h = (h / 100) * videoH;
            }
            if (x < videoW && y < videoH) spatial = { x, y, w, h };
          }
        }
      }
    }
    const window = temporal
      ? { start: temporal.start, end: temporal.end ?? Number.POSITIVE_INFINITY }
      : { start: 0, end: Number.POSITIVE_INFINITY };
    const dest: Rect = spatial ? { x: spatial.x, y: spatial.y, w: spatial.w, h: spatial.h } : { x: 0, y: 0, w: videoW, h: videoH };

    for (const body of asArray<any>(ann.body)) {
      if (!body || typeof body !== "object") continue;
      if (/^image\/svg\+xml$/.test(String(body.format ?? "")) || /\.svg$/i.test(String(body.id ?? ""))) {
        let svgText = "";
        try {
          svgText = await fetchers.fetchSvg(abs(String(body.id), manifestUrl));
        } catch {
          continue;
        }
        const attrs = readAttrs(svgText);
        const sec = nativeSecurity(svgText);
        overlays.push({
          id: String(ann.id ?? body.id ?? `native-c-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: attrs,
          placement: nativePlacement(dest, attrs),
          security: sec,
          rules: [
            { rule: "Model C: Web Annotation body+target (no painting motivation)", provenance: "NORMATIVE" },
            { rule: "spatial frame = video intrinsic dimensions (probe required)", provenance: "DERIVED" },
            { rule: "z-order = annotation order (convention)", provenance: "CONVENTION" },
            {
              rule: attrs.viewBox
                ? `viewBox -> region per preserveAspectRatio`
                : "no viewBox => 1:1 user units; preserveAspectRatio ignored",
              provenance: attrs.viewBox ? "NORMATIVE" : "OPEN",
            },
          ],
          kind: "svg",
          svgText,
        });
      } else if (body.type === "TextualBody") {
        overlays.push({
          id: String(ann.id ?? `native-c-text-${z}`),
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
      } else if (/^image\/(?!svg)/.test(String(body.format ?? ""))) {
        overlays.push({
          id: String(ann.id ?? body.id ?? `native-c-img-${z}`),
          model: "C",
          startTime: window.start,
          endTime: window.end,
          zIndex: z++,
          destination: dest,
          svgAttrs: {},
          placement: { mode: "image-contain", viewport: dest, scale: null, translation: { x: dest.x, y: dest.y } },
          security: { level: "safe", blocking: [], decision: "render" },
          resourceUrl: abs(String(body.id), manifestUrl),
          rules: [{ rule: "Raster image rendered as <img> (object-fit contain)", provenance: "CONVENTION" }],
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