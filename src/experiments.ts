import type { Keyframe, ReferenceOverlay, ResolvedOverlay } from "./lib/types.ts";

/**
 * Reference (Renderer B) overlays per experiment. These mirror the same SVG
 * files referenced by the IIIF manifests, so that resolved-set equality is a
 * meaningful test of whether Renderer A carries the same information.
 */

export const VIDEO = "/video/test-grid-1920x1080-30s.mp4";

async function svg(path: string): Promise<string> {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`failed to load reference svg ${path}: ${r.status}`);
  return r.text();
}

export interface ExpRefs {
  refs: ReferenceOverlay[];
  /** True when raw resolved-set equality can be tested (same svg payloads). */
  rawEqual: boolean;
  keyframesUrl?: string;
}

const full = { startTime: 0, endTime: 30 };

export async function expRefs(id: string): Promise<ExpRefs> {
  switch (id) {
    case "1":
      return {
        rawEqual: true,
        refs: [{ startTime: 10, endTime: 15, zIndex: 0, svg: await svg("/svg/exp1-circle.svg") }],
      };
    case "2":
      return {
        rawEqual: true,
        refs: [{ ...full, zIndex: 0, svg: await svg("/svg/exp2-primitives.svg") }],
      };
    case "3": {
      const svgs = [
        "/svg/exp3-yellow-rect.svg",
        "/svg/exp3-red-circle.svg",
        "/svg/exp3-arrow.svg",
        "/svg/exp3-text.svg",
      ];
      return {
        rawEqual: true,
        refs: [
          { ...full, zIndex: 0, svg: await svg(svgs[0]!) },
          { ...full, zIndex: 1, svg: await svg(svgs[1]!) },
          { ...full, zIndex: 2, svg: await svg(svgs[2]!) },
          { ...full, zIndex: 3, svg: await svg(svgs[3]!) },
        ],
      };
    }
    case "4": {
      // Match the four xywh-targeted annotations in exp4.json.
      return {
        rawEqual: false, // oracle uses baked coords; equivalence is geometric
        refs: [
          { id: "region-circles", ...full, zIndex: 0, svg: await svg("/svg/exp4-pos-00.svg") },
          { id: "region-circles-t", ...full, zIndex: 1, svg: await svg("/svg/exp4-pos-960540.svg") },
          { id: "region-pct", ...full, zIndex: 2, svg: await svg("/svg/exp4-pos-pct.svg") },
          {
            id: "region-timed",
            startTime: 10,
            endTime: 20,
            zIndex: 3,
            svg: await svg("/svg/exp4-pos-timed.svg"),
          },
        ],
      };
    }
    case "5a":
      return { rawEqual: true, refs: [{ ...full, zIndex: 0, svg: await svg("/svg/exp5-viewbox-1920.svg") }] };
    case "5b":
      return { rawEqual: true, refs: [{ ...full, zIndex: 0, svg: await svg("/svg/exp5-viewbox-1000.svg") }] };
    case "5c":
      return { rawEqual: true, refs: [{ ...full, zIndex: 0, svg: await svg("/svg/exp5-viewbox-64.svg") }] };
    case "6":
      // Reuses the exp1 content; the ASPECT is the variable.
      return {
        rawEqual: true,
        refs: [
          { startTime: 10, endTime: 15, zIndex: 0, svg: await svg("/svg/exp1-circle.svg") },
        ],
      };
    case "7": {
      const keyframes: Keyframe[] = [
        { t: 10, x: 100, y: 500 },
        { t: 15, x: 300, y: 500 },
        { t: 20, x: 600, y: 500 },
      ];
      return {
        rawEqual: true,
        keyframesUrl: "/manifests/exp7-keyframes.json",
        refs: [
          { startTime: 10, endTime: 25, zIndex: 0, svg: await svg("/svg/exp7-dot.svg"), keyframes },
        ],
      };
    }
    default:
      throw new Error(`unknown experiment ${id}`);
  }
}

/** Normalized field-wise comparison used for resolved-set parity checks. */
export function sameOverlay(a: ResolvedOverlay, b: ResolvedOverlay): string[] {
  const diffs: string[] = [];
  // `id` is excluded on purpose: renderer B synthesizes ids (ref-N). The
  // informative payload is the time window, z-order, SVG body and target region.
  if (Math.abs(a.startTime - b.startTime) > 1e-6) diffs.push(`start: ${a.startTime} != ${b.startTime}`);
  if (Math.abs(a.endTime - b.endTime) > 1e-6) diffs.push(`end: ${a.endTime} != ${b.endTime}`);
  if (a.zIndex !== b.zIndex) diffs.push(`z: ${a.zIndex} != ${b.zIndex}`);
  if (a.svgText !== b.svgText) diffs.push("svgText differs");
  const va = a.viewport;
  const vb = b.viewport;
  if (
    va.x !== vb.x || va.y !== vb.y || va.w !== vb.w || va.h !== vb.h
  ) {
    diffs.push(`viewport: ${JSON.stringify(va)} != ${JSON.stringify(vb)}`);
  }
  const ka = a.keyframes;
  const kb = b.keyframes;
  if (ka?.length !== kb?.length) diffs.push("keyframes length differs");
  else if (ka && kb) {
    for (let i = 0; i < ka.length; i++) {
      if (ka[i]!.t !== kb[i]!.t || ka[i]!.x !== kb[i]!.x || ka[i]!.y !== kb[i]!.y) {
        diffs.push(`keyframe[${i}] differs`);
        break;
      }
    }
  }
  return diffs;
}