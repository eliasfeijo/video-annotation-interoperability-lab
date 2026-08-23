/**
 * Blind vs Reference — semantic comparison harness (comparison infrastructure).
 *
 * Location: src/comparison/ (Phase H.2-B). This module is NOT part of the
 * blind renderer's semantic resolution and is not a renderer namespace member;
 * it is a test/evidence harness that lowers BOTH renderers' outputs into a
 * common "semantic overlay" record and diffs them. It is allowed to touch the
 * reference model (types + placement predictor) precisely so that it can
 * compare like-for-like; it must never feed reference logic back into
 * src/blind/resolver.ts. The "blind comparison" name is the historical era
 * coordinate of this mechanism (N-06); physical location does not establish
 * semantic ownership for either consumer.
 *
 * The semantic record answers: "where does this body's content land, when is it
 * visible, at what depth?" rather than comparing raw pixels.
 */

import type {
  ResolvedManifest as RefManifest,
  ResolvedOverlay as RefOverlay,
  SvgBox,
} from "../reference/lib/types.ts";
import {
  computeNestedSvgPlacement,
  canvasPointOfSvgUserPoint,
} from "../reference/lib/svg.ts";
import type {
  BlindManifest,
  BlindOverlay,
  IiifMode,
  Placement,
} from "../blind/types.ts";
import { canvasPointOf } from "../blind/placement.ts";

export interface SemanticPoint {
  user: { x: number; y: number };
  canvas: { x: number; y: number };
}

export interface SemanticOverlay {
  id: string;
  startTime: number;
  endTime: number;
  zIndex: number;
  /** Destination region in Canvas units. */
  region: { x: number; y: number; w: number; h: number };
  svgAttrs: {
    viewBox?: SvgBox;
    preserveAspectRatio?: string;
    width?: number;
    height?: number;
  };
  /** User-space landmarks sampled through each renderer's own mapping. */
  landmarks: SemanticPoint[];
  /** Blind-only security classification (reference has no such concept). */
  security?: { level: "safe" | "unsupported" | "unsafe"; blocking: string[] };
}

export interface ComparisonResult {
  case: string;
  mode: IiifMode;
  canvas: { width: number; height: number; duration: number | null };
  reference: SemanticOverlay[];
  blind: SemanticOverlay[];
  /** Per-index diff arrays; empty = match. */
  diffs: string[][];
  /** Match / difference / classified tags per overlay. */
  verdicts: ("match" | "difference" | "absent")[];
  /** Machine classification of each disagreement. */
  classifications: string[];
}

/** Landmarks in the body's own user-space coordinate system. */
function landmarkPoints(overlay: { svgAttrs: { viewBox?: SvgBox; width?: number; height?: number } }, region: { w: number; h: number }): { x: number; y: number }[] {
  const vb = overlay.svgAttrs.viewBox;
  const w = vb?.w ?? overlay.svgAttrs.width ?? region.w;
  const h = vb?.h ?? overlay.svgAttrs.height ?? region.h;
  return [
    { x: vb?.minX ?? 0, y: vb?.minY ?? 0 },
    { x: (vb?.minX ?? 0) + w, y: vb?.minY ?? 0 },
    { x: vb?.minX ?? 0, y: (vb?.minY ?? 0) + h },
    { x: (vb?.minX ?? 0) + w, y: (vb?.minY ?? 0) + h },
    { x: (vb?.minX ?? 0) + w / 2, y: (vb?.minY ?? 0) + h / 2 },
  ];
}

function snap(n: number): number {
  return Math.round(n * 1e3) / 1e3;
}

function pointEq(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
}

/** Lower a reference ResolvedOverlay into the semantic record. */
export function normalizeReference(
  ref: RefOverlay,
  canvas: { width?: number; height?: number },
): SemanticOverlay {
  const placement = computeNestedSvgPlacement(
    ref.viewport,
    ref.svgAttrs,
    canvas.width ?? 1920,
    canvas.height ?? 1080,
  );
  const predictor = {
    x: placement.x,
    y: placement.y,
    w: placement.w,
    h: placement.h,
    viewBox: placement.viewBox!,
    preserveAspectRatio: placement.preserveAspectRatio ?? "xMidYMid meet",
  };
  const landmarks = landmarkPoints(ref, ref.viewport).map((p) => ({
    user: { x: snap(p.x), y: snap(p.y) },
    canvas: canvasPointOfSvgUserPoint(p, predictor),
  }));
  const svgAttrs: SemanticOverlay["svgAttrs"] = {};
  if (ref.svgAttrs.viewBox) svgAttrs.viewBox = ref.svgAttrs.viewBox;
  if (ref.svgAttrs.preserveAspectRatio) svgAttrs.preserveAspectRatio = ref.svgAttrs.preserveAspectRatio;
  if (ref.svgAttrs.width !== undefined) svgAttrs.width = ref.svgAttrs.width;
  if (ref.svgAttrs.height !== undefined) svgAttrs.height = ref.svgAttrs.height;
  return {
    id: ref.id,
    startTime: ref.startTime,
    endTime: ref.endTime,
    zIndex: ref.zIndex,
    region: { x: ref.viewport.x, y: ref.viewport.y, w: ref.viewport.w, h: ref.viewport.h },
    svgAttrs,
    landmarks,
  };
}

/** Lower a blind BlindOverlay into the semantic record. */
export function normalizeBlind(
  ov: BlindOverlay,
  canvas: { width?: number; height?: number },
): SemanticOverlay {
  const p: Placement = ov.placement;
  const landmarks = landmarkPoints(ov, ov.destination).map((pt) => ({
    user: { x: snap(pt.x), y: snap(pt.y) },
    canvas: canvasPointOf(p, pt),
  }));
  const svgAttrs: SemanticOverlay["svgAttrs"] = {};
  if (ov.svgAttrs.viewBox) svgAttrs.viewBox = ov.svgAttrs.viewBox;
  if (ov.svgAttrs.preserveAspectRatio) svgAttrs.preserveAspectRatio = ov.svgAttrs.preserveAspectRatio;
  if (ov.svgAttrs.width !== undefined) svgAttrs.width = ov.svgAttrs.width;
  if (ov.svgAttrs.height !== undefined) svgAttrs.height = ov.svgAttrs.height;
  return {
    id: ov.id,
    startTime: ov.startTime,
    endTime: ov.endTime,
    zIndex: ov.zIndex,
    region: {
      x: ov.destination.x,
      y: ov.destination.y,
      w: ov.destination.w,
      h: ov.destination.h,
    },
    svgAttrs,
    landmarks,
    security: {
      level: ov.security.level,
      blocking: ov.security.blocking,
    },
  };
}

/**
 * Compare a resolved reference set against a blind set.
 * Index matching is by encounter order (both renderers assign zIndex in
 * encounter order); if counts differ the verdict is recorded as absent.
 */
export function compareSemantics(
  ref: RefManifest,
  blind: BlindManifest,
  caseName: string,
): ComparisonResult {
  const refSem = ref.overlays.map((o) => normalizeReference(o, ref.canvas));
  const blindSem = blind.overlays.map((o) => normalizeBlind(o, blind.canvas));

  const diffs: string[][] = [];
  const verdicts: ComparisonResult["verdicts"] = [];
  const classifications: string[] = [];
  const n = Math.max(refSem.length, blindSem.length);

  for (let i = 0; i < n; i++) {
    const a = refSem[i];
    const b = blindSem[i];
    if (!a || !b) {
      diffs.push([a ? "blind missing overlay" : "reference missing overlay"]);
      verdicts.push("absent");
      classifications.push(a ? "gap: blind did not resolve overlay" : "gap: reference did not resolve overlay");
      continue;
    }
    const d: string[] = [];
    if (Math.abs(a.startTime - b.startTime) > 1e-6) d.push(`start ${a.startTime} != ${b.startTime}`);
    if (Math.abs(a.endTime - b.endTime) > 1e-6) d.push(`end ${a.endTime} != ${b.endTime}`);
    if (a.zIndex !== b.zIndex) d.push(`z ${a.zIndex} != ${b.zIndex}`);
    if (
      a.region.x !== b.region.x ||
      a.region.y !== b.region.y ||
      a.region.w !== b.region.w ||
      a.region.h !== b.region.h
    ) {
      d.push(
        `region: ref(${a.region.x},${a.region.y},${a.region.w},${a.region.h}) != blind(${b.region.x},${b.region.y},${b.region.w},${b.region.h})`,
      );
    }
    if (b.security && b.security.level === "unsafe") {
      d.push(`security: blind rejects unsafe svg (${b.security.blocking.join(", ")})`);
    }
    if (b.security && b.security.level === "unsupported") {
      d.push(`security: blind sanitizes unsupported features`);
    }
    for (let k = 0; k < Math.max(a.landmarks.length, b.landmarks.length); k++) {
      const la = a.landmarks[k];
      const lb = b.landmarks[k];
      if (la && lb && !pointEq(la.canvas, lb.canvas)) {
        d.push(
          `landmark[${k}] (${la.user.x},${la.user.y}) -> ref(${snap(la.canvas.x)},${snap(la.canvas.y)}) blind(${snap(lb.canvas.x)},${snap(lb.canvas.y)})`,
        );
      }
    }
    diffs.push(d);
    if (d.length === 0) {
      verdicts.push("match");
      classifications.push("match");
    } else {
      verdicts.push("difference");
      classifications.push(classifyDifference(d, a, b));
    }
  }
  return {
    case: caseName,
    mode: blind.mode,
    canvas: {
      width: blind.canvas.width,
      height: blind.canvas.height,
      duration: blind.canvas.duration,
    },
    reference: refSem,
    blind: blindSem,
    diffs,
    verdicts,
    classifications,
  };
}

function classifyDifference(d: string[], a: SemanticOverlay, b: SemanticOverlay): string {
  if (d.some((x) => x.startsWith("security: blind rejects"))) {
    return "difference:security-rejection (blind refuses unsafe SVG; reference sanitizes and renders)";
  }
  if (d.some((x) => x.startsWith("security: blind sanitizes"))) {
    return "difference:security-sanitization";
  }
  if (d.some((x) => x.startsWith("region:"))) {
    return "difference:spatial-fragment-validation (blind drops out-of-bounds region per MF §6.3.3; reference does not validate)";
  }
  if (d.some((x) => x.startsWith("start") || x.startsWith("end"))) {
    return "difference:temporal";
  }
  if (d.some((x) => x.startsWith("z"))) {
    return "difference:z-order";
  }
  if (d.some((x) => x.startsWith("landmark"))) {
    const noVb = !a.svgAttrs.viewBox && !b.svgAttrs.viewBox;
    if (noVb) {
      return "difference:no-viewBox-placement (blind=1:1, reference=synthetic viewBox)";
    }
    return "difference:landmark-placement";
  }
  return "difference:other";
}