import { expRefs, sameOverlay, VIDEO } from "./experiments.ts";
import { resolveManifest } from "./reference/lib/iiif.ts";
import {
  allowlistSanitizer,
  identitySanitizer,
} from "./reference/lib/sanitize.ts";
import type {
  CanvasInfo,
  RendererKind,
  ResolvedOverlay,
} from "./reference/lib/types.ts";
import { Stage, type Fit } from "./reference/renderers/dom.ts";
import { resolveReference } from "./reference/renderers/rendererB.ts";
import { resolveBlindManifest } from "./blind/resolver.ts";
import { BlindStage } from "./blind/compositor.ts";
import { compareSemantics } from "./blind/comparison.ts";
import type { BlindManifest, BlindOverlay } from "./blind/types.ts";
import { classifySvg, sanitizeSvg } from "./blind/sanitize.ts";
import { resolveE14Manifest } from "./reference/lib/e14.ts";
import { resolveBlindE14Manifest } from "./blind/e14.ts";
import { resolveNativeManifest } from "./native/resolver.ts";
import { NativeStage } from "./native/stage.ts";
import { compareE14 } from "./e14/comparison.ts";
import type { E14Manifest, E14Overlay } from "./e14/types.ts";
import type { ResolvedOverlay as RefOverlay } from "./reference/lib/types.ts";
import type {
  SvgRootAttrs as BlindSvgAttrs,
} from "./blind/types.ts";
import "./style.css";

interface LabApi {
  exp: string;
  renderer: RendererKind | "blind" | "native";
  canvas: CanvasInfo;
  videoUrl: string | null;
  resolvedA: () => ResolvedOverlay[];
  resolvedB: () => ResolvedOverlay[];
  blindResolved: () => BlindManifest | null;
  e14Resolved: () => Partial<Record<"a" | "blind" | "native", E14Manifest | null>>;
  e14Compare: () => ReturnType<typeof compareE14>;
  imgMetrics: (id: string) => { box: DOMRect; naturalW: number; naturalH: number } | null;
  parity: () => string[][];
  parityBlind: () => {
    verdicts: string[];
    classifications: string[];
    diffs: string[][];
  };
  seek: (t: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  activeIds: (t?: number) => string[];
  snapshot: () => ReturnType<Stage["geometrySnapshot"]>;
  overlayRect: (id: string) => DOMRect | null;
  toCanvasPoint: (x: number, y: number) => { x: number; y: number };
  canvasToCss: (x: number, y: number) => { x: number; y: number };
  currentTime: () => number;
  layerCount: () => number;
  setFit: (f: Fit) => void;
  setSanitize: (on: boolean) => void;
  domProbe: (id: string, selector: string) => string | null;
}

declare global {
  interface Window {
    __lab: LabApi;
  }
}

const params = new URLSearchParams(location.search);
const exp = params.get("exp") ?? "1";
const rawRenderer = params.get("renderer") ?? "a";
const renderer = rawRenderer === "blind"
  ? "blind"
  : rawRenderer === "native"
    ? "native"
    : (rawRenderer === "b" && exp !== "7-animate" ? "b" : "a") as RendererKind;
const sanitizeOn = params.get("sanitize") !== "0";
const fit = (params.get("fit") ?? "contain") as Fit;

const ELEMENT = document.getElementById("stage-root");
const viewport = document.getElementById("viewport");
const hud = document.getElementById("hud")!;
if (!ELEMENT || !viewport)
  throw new Error("missing stage-root/viewport elements");

const isNative = renderer === "native";
const isBlind = renderer === "blind";
const stage = isNative
  ? new NativeStage(ELEMENT)
  : isBlind
    ? new BlindStage(ELEMENT)
    : new Stage(ELEMENT);
if (!isBlind && !isNative) {
  (stage as Stage).setSanitizer(sanitizeOn ? allowlistSanitizer : identitySanitizer);
}
stage.setFit(fit);

const aspectPreset = params.get("aspect");
if (aspectPreset === "4:3") viewport.className = "viewport ar-43";
else if (aspectPreset === "narrow") viewport.className = "viewport ar-narrow";
else if (aspectPreset === "wide") viewport.className = "viewport ar-wide";
else viewport.className = "viewport ar-169";

let canvasInfo: CanvasInfo = {};
let videoUrl: string | null = null;
let resolvedA: ResolvedOverlay[] = [];
let resolvedB: ResolvedOverlay[] = [];
let blind: BlindManifest | null = null;
let e14Manifests: Partial<Record<"a" | "blind" | "native", E14Manifest | null>> = {};

const MANIFEST_MAP: Record<string, string> = {
  "6": "exp1.json",
  text: "exp-text.json",
  security: "exp-security.json",
};

/** Lab-harness bridge: E14 record -> Renderer A's ResolvedOverlay (DOM only). */
function e14ToResolvedA(ov: E14Overlay): ResolvedOverlay {
  return {
    id: ov.id,
    startTime: ov.startTime,
    endTime: ov.endTime,
    zIndex: ov.zIndex,
    svgText: ov.svgText ?? "",
    svgAttrs: ov.svgAttrs,
    viewport: {
      x: ov.destination.x,
      y: ov.destination.y,
      w: ov.destination.w,
      h: ov.destination.h,
    },
  };
}

/** Lab-harness bridge: E14 record -> BlindOverlay (DOM only, SVG kind). */
function e14ToBlindOverlay(ov: E14Overlay): BlindOverlay | null {
  if (ov.kind !== "svg" || !ov.svgText) return null;
  const cls = classifySvg(ov.svgText);
  const p = ov.placement;
  return {
    id: ov.id,
    startTime: ov.startTime,
    endTime: ov.endTime,
    zIndex: ov.zIndex,
    svgText: ov.svgText,
    svgAttrs: ov.svgAttrs as unknown as BlindSvgAttrs,
    destination: ov.destination,
    placement: {
      viewport: ov.destination,
      viewBox: ov.svgAttrs.viewBox ?? null,
      preserveAspectRatio: ov.svgAttrs.preserveAspectRatio ?? null,
      mode:
        p.mode === "nested-canvas" || p.mode === "image-contain"
          ? "no-viewBox-1to1"
          : p.mode,
      scale: p.scale,
      translation: p.translation,
    },
    security: { ...cls, sanitized: sanitizeSvg(ov.svgText) },
    rules: ov.rules as unknown as BlindOverlay["rules"],
    mode: ov.model === "B" ? "B" : "A",
  };
}

async function boot(): Promise<void> {
  // Experiment E14 path: load the e14 fixture, resolve it with all three
  // renderers, and drive the stage chosen by `?renderer=`.
  if (exp.startsWith("e14")) {
    const manifestUrl = `${location.origin}/manifests/e14/${exp}.json`;
    const res = await fetch(manifestUrl);
    if (!res.ok)
      throw new Error(`e14 manifest fetch failed: ${res.status}`);
    const manifest = await res.json();
    const fetchers = {
      fetchSvg: async (url: string) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`svg fetch failed: ${r.status}`);
        return r.text();
      },
      fetchManifest: async (url: string) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`manifest fetch failed: ${r.status}`);
        return r.json();
      },
    };
    const e14a = await resolveE14Manifest(manifest, manifestUrl, fetchers);
    const e14blind = await resolveBlindE14Manifest(manifest, manifestUrl, fetchers);
    const e14native = await resolveNativeManifest(manifest, manifestUrl, fetchers);
    e14Manifests = { a: e14a, blind: e14blind, native: e14native };
    canvasInfo = {
      id: e14a.canvas.id,
      width: e14a.canvas.width,
      height: e14a.canvas.height,
    };
    if (e14a.canvas.duration != null) canvasInfo.duration = e14a.canvas.duration;
    videoUrl = e14a.videoUrl ?? `${location.origin}${VIDEO}`;

    if (isNative) {
      (stage as NativeStage).setCanvas(e14native.canvas);
      (stage as NativeStage).setOverlays(e14native.overlays);
    } else if (isBlind) {
      const conv = e14blind.overlays
        .map(e14ToBlindOverlay)
        .filter((o): o is BlindOverlay => o !== null);
      (stage as BlindStage).setCanvas({
        id: canvasInfo.id ?? "",
        width: canvasInfo.width ?? 0,
        height: canvasInfo.height ?? 0,
        duration: canvasInfo.duration ?? null,
      });
      (stage as BlindStage).setOverlays(conv);
    } else {
      (stage as Stage).setCanvas(canvasInfo);
      (stage as Stage).setOverlays(
        e14a.overlays.filter((o) => o.kind === "svg").map(e14ToResolvedA),
      );
    }
    if (videoUrl) {
      stage.videoElement.src = videoUrl;
    }
    await stage.videoElement.play().catch(() => {});
    return;
  }

  const manifestName =
    MANIFEST_MAP[exp] ??
    (exp.startsWith("case") ? `${exp}.json` : `exp${exp}.json`);
  const manifestUrl = `${location.origin}/manifests/${manifestName}`;
  const manifestRes = await fetch(manifestUrl);
  if (!manifestRes.ok)
    throw new Error(`manifest fetch failed: ${manifestRes.status}`);
  const manifest = await manifestRes.json();

  const r = await resolveManifest(manifest, manifestUrl, async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`svg fetch failed: ${res.status}`);
    return res.text();
  });
  canvasInfo = r.canvas;
  videoUrl = r.videoUrl ?? `${location.origin}${VIDEO}`;

  // Blind resolution: the independent renderer path (only used for
  // `?renderer=blind`; resolved eagerly so parityBlind can always compare).
  blind = await resolveBlindManifest(manifest, async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`svg fetch failed: ${res.status}`);
    return res.text();
  });

  // exp7: attach the experimental keyframe timeline (NON-STANDARD, outside IIIF).
  let expRef: Awaited<ReturnType<typeof expRefs>> | null = null;
  try {
    expRef = await expRefs(exp);
  } catch {
    expRef = null;
  }
  if (exp === "7" && expRef?.keyframesUrl) {
    const res = await fetch(`${location.origin}${expRef.keyframesUrl}`);
    const ext = await res.json();
    const byId = new Map<string, any[]>(
      (ext.annotations ?? []).map((a: any) => [
        a.id,
        (a.keyframes as any[]) ?? [],
      ]),
    );
    for (const ov of r.overlays) {
      const keys = byId.get(ov.id);
      if (keys?.length)
        ov.keyframes = keys.map((k) => ({ t: k.t, x: k.x, y: k.y }));
    }
  }

  resolvedA = r.overlays;
  resolvedB = expRef ? resolveReference(expRef.refs, canvasInfo) : [];

  if (isBlind) {
    (stage as BlindStage).setCanvas({
      id: canvasInfo.id ?? "",
      width: canvasInfo.width ?? 0,
      height: canvasInfo.height ?? 0,
      duration: canvasInfo.duration ?? null,
    });
  } else {
    (stage as Stage).setCanvas(canvasInfo);
  }
  if (isBlind && blind) {
    (stage as BlindStage).setOverlays(blind.overlays);
  } else {
    (stage as Stage).setOverlays(renderer === "b" ? resolvedB : resolvedA);
  }
  if (videoUrl) {
    stage.videoElement.src = videoUrl;
  }
  await stage.videoElement.play().catch(() => {});
}

void boot().then(() => {
  const setTime = async (t: number): Promise<void> => {
    const v = stage.videoElement;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        v.removeEventListener("seeked", onSeeked);
        resolve();
      };
      v.addEventListener("seeked", onSeeked);
      v.currentTime = t;
    });
    stage.applyAt(v.currentTime);
  };

  window.__lab = {
    exp,
    renderer,
    canvas: canvasInfo,
    videoUrl,
    resolvedA: () => resolvedA,
    resolvedB: () => resolvedB,
    blindResolved: () => blind,
    e14Resolved: () => e14Manifests,
    e14Compare: () => compareE14(e14Manifests),
    imgMetrics: (id) =>
      isNative ? (stage as NativeStage).imgMetrics(id) : null,
    parity: () => {
      const d = resolvedA.map((a, i) =>
        sameOverlay(
          a,
          resolvedB[i] ?? ({ id: "(missing)" } as unknown as ResolvedOverlay),
        ),
      );
      return d.length === resolvedB.length ? d : [["length differs"]];
    },
    parityBlind: () => {
      if (!blind) return { verdicts: [], classifications: [], diffs: [] };
      const res = compareSemantics(
        { canvas: canvasInfo, videoUrl, overlays: resolvedA },
        blind,
        exp,
      );
      return {
        verdicts: res.verdicts,
        classifications: res.classifications,
        diffs: res.diffs,
      };
    },
    seek: setTime,
    play: () => stage.videoElement.play(),
    pause: () => stage.videoElement.pause(),
    activeIds: (t) => stage.activeIds(t ?? stage.videoElement.currentTime),
    snapshot: () => {
      stage.applyAt(stage.videoElement.currentTime);
      return (stage as Stage).geometrySnapshot();
    },
    overlayRect: (id) => {
      const g = stage.overlaySvg.querySelector(
        `[data-overlay-id="${id}"] [data-overlay-nested]`,
      );
      return g ? g.getBoundingClientRect() : null;
    },
    toCanvasPoint: (x, y) => stage.toCanvasPoint(x, y),
    canvasToCss: (x, y) => stage.canvasToCssPoint(x, y),
    currentTime: () => stage.videoElement.currentTime,
    layerCount: () => (isBlind && blind ? blind.overlays.length : resolvedA.length),
    setFit: (f) => stage.setFit(f),
    setSanitize: (on) => {
      if (isBlind) return; // blind sanitization is decided at resolve time
      (stage as Stage).setSanitizer(on ? allowlistSanitizer : identitySanitizer);
      (stage as Stage).setOverlays(renderer === "b" ? resolvedB : resolvedA);
    },
    domProbe: (id, selector) => {
      const g = stage.overlaySvg.querySelector(`[data-overlay-id="${id}"]`);
      const el = g?.querySelector(selector);
      return el
        ? (el.getAttribute("transform") ??
            el.getAttribute("x") ??
            el.getAttribute("cx") ??
            null)
        : null;
    },
  };

  const initialT = params.get("t");
  if (initialT) void setTime(parseFloat(initialT));
  hud.textContent = `exp=${exp} renderer=${renderer} sanitize=${sanitizeOn ? "on" : "off"} fit=${fit} aspect=${aspectPreset ?? "16:9"}`;
  document.dispatchEvent(
    new CustomEvent("lab-ready", { detail: { exp, renderer } }),
  );
});

// HUD clock + active overlay readout.
window.setInterval(() => {
  hud.textContent = `exp=${exp} renderer=${renderer} t=${stage.videoElement.currentTime.toFixed(3)}s active=[${stage.activeIds(stage.videoElement.currentTime).join(", ")}]`;
}, 250);

export {};
