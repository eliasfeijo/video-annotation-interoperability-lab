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
import type { BlindManifest } from "./blind/types.ts";
import "./style.css";

interface LabApi {
  exp: string;
  renderer: RendererKind | "blind";
  canvas: CanvasInfo;
  videoUrl: string | null;
  resolvedA: () => ResolvedOverlay[];
  resolvedB: () => ResolvedOverlay[];
  blindResolved: () => BlindManifest | null;
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
const renderer =
  rawRenderer === "blind" ? "blind" : (rawRenderer === "b" && exp !== "7-animate" ? "b" : "a") as RendererKind;
const sanitizeOn = params.get("sanitize") !== "0";
const fit = (params.get("fit") ?? "contain") as Fit;

const ELEMENT = document.getElementById("stage-root");
const viewport = document.getElementById("viewport");
const hud = document.getElementById("hud")!;
if (!ELEMENT || !viewport)
  throw new Error("missing stage-root/viewport elements");

const isBlind = renderer === "blind";
const stage = isBlind ? new BlindStage(ELEMENT) : new Stage(ELEMENT);
if (!isBlind) {
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

const MANIFEST_MAP: Record<string, string> = {
  "6": "exp1.json",
  text: "exp-text.json",
  security: "exp-security.json",
};

async function boot(): Promise<void> {
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
      return stage.geometrySnapshot();
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
