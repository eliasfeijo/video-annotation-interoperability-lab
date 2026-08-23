/**
 * Experiment E17 — measurement/classification helpers.
 *
 * The scoring math (mask prediction, symmetric tolerance coverage, verdicts)
 * is lifted VERBATIM from tests/e2e/embedding-semantics.spec.ts so E17 thresholds are exactly
 * the E15 thresholds: K = 0.25 css px per canvas unit, coverage TOL_MIN 0.8,
 * dilation radius 3, SAMPLE_STRIDE 1. The e15 spec keeps its private copy
 * untouched (historical harness stays frozen); this module only re-exposes it
 * as importable infrastructure and parameterizes the variant/region/landmark
 * lookups so both /e15-lab.html and /e17-lab.html cells can be scored.
 *
 * Interpretation maps come from src/embedding-semantics/analysis.ts — analysis
 * infrastructure, never renderer resolution logic.
 */

import { PNG } from "pngjs";
import {
  EMBEDDING_SPACE,
  INTERPRETATIONS_BY_EMBEDDING,
  INTERPRETATION_NAMES,
  type EmbeddingMechanism,
  type LandmarkContract,
  type PlacementMap,
  type CanvasRect,
  type SvgVariant,
} from "../embedding-semantics/analysis.ts";

export const K = 0.25; // css px per canvas unit

export interface BoxPx {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const SAMPLE_STRIDE = 1; // css px between mask samples (AA-sensitive stroke band)

export const isRed = (r: number, g: number, b: number) => r > 140 && r - g > 50 && r - b > 50;
export const isBlue = (r: number, g: number, b: number) => b > 140 && b - r > 50 && b - g > 50;

export function scanColor(png: PNG, pred: (r: number, g: number, b: number) => boolean): BoxPx | null {
  let minx = Infinity,
    miny = Infinity,
    maxx = -Infinity,
    maxy = -Infinity,
    n = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) * 4;
      if (pred(png.data[i]!, png.data[i + 1]!, png.data[i + 2]!)) {
        n++;
        if (x < minx) minx = x;
        if (y < miny) miny = y;
        if (x > maxx) maxx = x;
        if (y > maxy) maxy = y;
      }
    }
  }
  return n >= 4 ? { minX: minx, minY: miny, maxX: maxx, maxY: maxy } : null;
}

function dilate(mask: boolean[], w: number, h: number, r: number): boolean[] {
  const out = new Array<boolean>(mask.length).fill(false);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          out[yy * w + xx] = true;
        }
      }
    }
  }
  return out;
}

/** Symmetric coverage score with anti-aliasing tolerance (E15 semantics). */
function tolScore(
  pred: boolean[],
  meas: boolean[],
  w: number,
  h: number,
  r = 2,
): { predCovered: number; measCovered: number } {
  const dp = dilate(pred, w, h, 3);
  const dm = dilate(meas, w, h, 3);
  let mIn = 0,
    mN = 0,
    pIn = 0,
    pN = 0;
  for (let i = 0; i < pred.length; i++) {
    if (meas[i]) {
      mN++;
      if (dp[i]) mIn++;
    }
    if (pred[i]) {
      pN++;
      if (dm[i]) pIn++;
    }
  }
  return {
    predCovered: pN === 0 ? 1 : pIn / pN,
    measCovered: mN === 0 ? 1 : mIn / mN,
  };
}

function predictedMasks(
  m: PlacementMap,
  lm: Pick<LandmarkContract, "frame" | "circle">,
  cellW: number,
  cellH: number,
  unitsPerCssPx: number,
): { blue: boolean[]; red: boolean[] } {
  const inv = (cx: number, cy: number) => ({
    x: (cx - m.tx) / m.sx,
    y: (cy - m.ty) / m.sy,
  });
  const blue: boolean[] = [];
  const red: boolean[] = [];
  const f = lm.frame;
  const sw = 4 / Math.max(Math.abs(m.sx), 1e-9);
  const sh = 4 / Math.max(Math.abs(m.sy), 1e-9);
  const fx0 = f.x - sw,
    fx1 = f.x + f.w + sw,
    fy0 = f.y - sh,
    fy1 = f.y + f.h + sh;
  const ix0 = f.x + sw,
    ix1 = f.x + f.w - sw,
    iy0 = f.y + sh,
    iy1 = f.y + f.h - sh;
  for (let cy = 0; cy < cellH; cy += SAMPLE_STRIDE) {
    for (let cx = 0; cx < cellW; cx += SAMPLE_STRIDE) {
      const u = inv((cx + SAMPLE_STRIDE / 2) * unitsPerCssPx, (cy + SAMPLE_STRIDE / 2) * unitsPerCssPx);
      const dx = u.x - lm.circle.cx;
      const dy = u.y - lm.circle.cy;
      blue.push(dx * dx + dy * dy <= lm.circle.r * lm.circle.r);
      const inOuter = u.x >= fx0 && u.x <= fx1 && u.y >= fy0 && u.y <= fy1;
      const inInner = u.x > ix0 && u.x < ix1 && u.y > iy0 && u.y < iy1;
      red.push(inOuter && !inInner);
    }
  }
  return { blue, red };
}

export interface ClassifierDeps {
  variants: SvgVariant[];
  regions: Array<{ key: string; fragment: string | null; rect: CanvasRect }>;
  landmarks: Record<string, LandmarkContract>;
}

/**
 * Score one measured cell against every interpretation its embedding could
 * legally implement. Same tolerances and same record shape as E15.
 */
export function makeClassifier(deps: ClassifierDeps) {
  const variantByName = (name: string) => deps.variants.find((v) => v.name === name)!;
  const regionByKey = (key: string) => deps.regions.find((r) => r.key === key)!;

  return function classifyCell(
    variantName: string,
    embedding: EmbeddingMechanism,
    regionKey: string,
    png: PNG,
    innerSvgBox: { x: number; y: number; w: number; h: number } | null,
    intrinsics: Record<string, { w: number; h: number }>,
  ) {
    const v = variantByName(variantName);
    const region = regionByKey(regionKey);
    const lm = deps.landmarks[variantName]!;
    const red = scanColor(png, isRed);
    const blue = scanColor(png, isBlue);

    const circleCenterCanvas = blue
      ? {
          x: ((blue.minX + blue.maxX + 1) / 2) / K + region.rect.x,
          y: ((blue.minY + blue.maxY + 1) / 2) / K + region.rect.y,
        }
      : null;
    const circleRadiusCanvas = blue
      ? {
          x: (blue.maxX - blue.minX + 1) / 2 / K,
          y: (blue.maxY - blue.minY + 1) / 2 / K,
        }
      : null;

    const matches: string[] = [];
    const predictions: Record<string, unknown> = {};
    const TOL_MIN = 0.8;
    const R = region.rect;
    const space = EMBEDDING_SPACE[embedding];
    const unitsPerCssPx = space === "canvas" ? 1 / K : 1;
    for (const fn of INTERPRETATIONS_BY_EMBEDDING[embedding]) {
      const name = INTERPRETATION_NAMES[fn.name] ?? fn.name;
      let m: PlacementMap;
      if (space === "canvas") {
        const g = fn(v, region.rect);
        m = { ...g, tx: g.tx - R.x, ty: g.ty - R.y };
      } else {
        m = fn(v, { x: 0, y: 0, w: png.width, h: png.height });
      }
      const pred = predictedMasks(m, lm, png.width, png.height, unitsPerCssPx);
      const mBlue: boolean[] = [];
      const mRed: boolean[] = [];
      let idx = 0;
      for (let cy = 0; cy < png.height; cy += SAMPLE_STRIDE) {
        for (let cx = 0; cx < png.width; cx += SAMPLE_STRIDE) {
          void idx;
          const xi = Math.min(png.width - 1, cx + 1);
          const yi = Math.min(png.height - 1, cy + 1);
          const i4 = (png.width * yi + xi) * 4;
          mBlue.push(isBlue(png.data[i4]!, png.data[i4 + 1]!, png.data[i4 + 2]!));
          mRed.push(isRed(png.data[i4]!, png.data[i4 + 1]!, png.data[i4 + 2]!));
        }
      }
      const sb = tolScore(pred.blue, mBlue, png.width, png.height);
      const sr = tolScore(pred.red, mRed, png.width, png.height);
      predictions[name] = {
        circle: { predCovered: +sb.predCovered.toFixed(3), measCovered: +sb.measCovered.toFixed(3) },
        frame: { predCovered: +sr.predCovered.toFixed(3), measCovered: +sr.measCovered.toFixed(3) },
      };
      if (Math.min(sb.predCovered, sb.measCovered) >= TOL_MIN && Math.min(sr.predCovered, sr.measCovered) >= TOL_MIN) {
        matches.push(name);
      }
    }

    const verdict: "agree" | "diverge" | "unmeasured" =
      matches.length === 0 ? (blue || red ? "diverge" : "unmeasured") : "agree";

    return {
      variant: variantName,
      embedding,
      regionKey,
      fragment: region.fragment,
      k: K,
      measured: {
        frameCss: red ? { ...red } : null,
        circleCss: blue
          ? {
              cx: (blue.minX + blue.maxX + 1) / 2,
              cy: (blue.minY + blue.maxY + 1) / 2,
              diameterX: blue.maxX - blue.minX + 1,
              diameterY: blue.maxY - blue.minY + 1,
            }
          : null,
        intrinsic: intrinsics[variantName] ?? null,
        innerSvgBox,
      },
      derived: {
        circleCenterCanvas,
        circleRadiusCanvas,
        uniformScale: blue ? Math.abs(circleRadiusCanvas!.x - circleRadiusCanvas!.y) <= 14 : null,
      },
      predictions,
      matches,
      verdict,
    };
  };
}
