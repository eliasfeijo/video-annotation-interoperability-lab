import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  EMBEDDING_SPACE,
  INTERPRETATIONS_BY_EMBEDDING,
  INTERPRETATION_NAMES,
  REGIONS,
  VARIANTS,
  mapPoint,
  type EmbeddingMechanism,
  type PlacementMap,
} from "../../src/embedding-semantics/analysis.ts";

/**
 * Experiment E15 — measures the resolved Canvas-space geometry of identical
 * SVG landmarks through every embedding mechanism, and classifies each cell
 * against named interpretations of the standards. Evidence:
 *   evidence/e15/summary.json, case-<variant>--<region>.json,
 *   geometry-matrix.json, intrinsics.json, screenshots/.
 */

const EVIDENCE = resolve("evidence", "e15");
const SHOTS = resolve(EVIDENCE, "screenshots");
const K = 0.25; // css px per canvas unit
const TOL_CENTER = 12; // canvas units (~3 css px at K)
const TOL_RADIUS = 14;

// Landmark user-space geometry (written by scripts/build-embedding-semantics-fixtures.mjs).
const LANDMARKS = JSON.parse(
  readFileSync(resolve("public", "svg", "e15", "e15-landmarks.json"), "utf8"),
) as Record<
  string,
  { W: number; H: number; frame: { x: number; y: number; w: number; h: number }; circle: { cx: number; cy: number; r: number }; tick: number }
>;

interface BoxPx {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function scanColor(png: PNG, pred: (r: number, g: number, b: number) => boolean): BoxPx | null {
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

const isRed = (r: number, g: number, b: number) => r > 140 && r - g > 50 && r - b > 50;
const isBlue = (r: number, g: number, b: number) => b > 140 && b - r > 50 && b - g > 50;

function variantByName(name: string) {
  return VARIANTS.find((v) => v.name === name)!;
}
function regionByKey(key: string) {
  return REGIONS.find((r) => r.key === key)!;
}

interface Prediction {
  map: PlacementMap;
}

const SAMPLE_STRIDE = 1; // css px between mask samples (AA-sensitive stroke band)

/**
 * Rasterize an interpretation's predicted landmark mask (circle disc + frame
 * stroke band) over the cell, by inverse-mapping sample points to user space.
 */
function predictedMasks(
  m: PlacementMap,
  lm: { frame: { x: number; y: number; w: number; h: number }; circle: { cx: number; cy: number; r: number } },
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
      // cell css (cx,cy) -> map space -> user
      const u = inv(
        (cx + SAMPLE_STRIDE / 2) * unitsPerCssPx,
        (cy + SAMPLE_STRIDE / 2) * unitsPerCssPx,
      );
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

function iou(a: boolean[], b: boolean[]): { score: number; aCount: number; bCount: number } {
  let inter = 0,
    ac = 0,
    bc = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i]) ac++;
    if (b[i]) bc++;
    if (a[i] && b[i]) inter++;
  }
  const uni = ac + bc - inter;
  return { score: uni === 0 ? (ac === 0 ? 1 : 0) : inter / uni, aCount: ac, bCount: bc };
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

/**
 * Symmetric coverage score with anti-aliasing tolerance: each mask must lie
 * (mostly) within a small dilation of the other.
 */
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

async function openLab(page: import("@playwright/test").Page): Promise<Record<string, { w: number; h: number }>> {
  await page.goto("/e15-lab.html");
  await page.waitForFunction(() => (window as any).__e15 !== undefined, null, { timeout: 20000 });
  await page.evaluate(() => (window as any).__e15.ready());
  return page.evaluate(() => (window as any).__e15.intrinsics());
}

async function shootCell(page: import("@playwright/test").Page, id: string): Promise<PNG> {
  const el = page.locator(`[data-cell="${id}"]`);
  await el.scrollIntoViewIfNeeded();
  return PNG.sync.read(await el.screenshot({ type: "png" }));
}

function classifyCell(
  variantName: string,
  embedding: EmbeddingMechanism,
  regionKey: string,
  png: PNG,
  innerSvgBox: { x: number; y: number; w: number; h: number } | null,
  intrinsics: Record<string, { w: number; h: number }>,
) {
  const v = variantByName(variantName);
  const region = regionByKey(regionKey);
  const lm = LANDMARKS[variantName]!;
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
  // canvas-space maps work in region-local canvas units (css * 1/K); css-space
  // maps already match cell pixels.
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
    // Measured masks on the same sample grid.
    const mBlue: boolean[] = [];
    const mRed: boolean[] = [];
    let idx = 0;
    for (let cy = 0; cy < png.height; cy += SAMPLE_STRIDE) {
      for (let cx = 0; cx < png.width; cx += SAMPLE_STRIDE) {
        // nearest sampled pixel
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
    if (
      Math.min(sb.predCovered, sb.measCovered) >= TOL_MIN &&
      Math.min(sr.predCovered, sr.measCovered) >= TOL_MIN
    ) {
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
      uniformScale: blue ? Math.abs(circleRadiusCanvas!.x - circleRadiusCanvas!.y) <= TOL_RADIUS : null,
    },
    predictions,
    matches,
    verdict,
  };
}

test.describe.configure({ mode: "serial" });

const CORE = ["e15-vb1000.svg", "e15-vb1920x1080.svg", "e15-novb1000.svg", "e15-novb1920x1080.svg"];

test("e15: builds the matrix and records browser intrinsic sizes", async ({ page }) => {
  const intrinsics = await openLab(page);
  const cells = await page.evaluate(() => (window as any).__e15.cells());
  expect(cells.length).toBe(4 * 4 * 8 + 6 * 8);

  mkdirSync(EVIDENCE, { recursive: true });
  writeFileSync(
    resolve(EVIDENCE, "intrinsics.json"),
    JSON.stringify(
      {
        note: "Browser-reported naturalWidth/naturalHeight per SVG variant (<img> probe, Chromium)",
        intrinsics,
      },
      null,
      2,
    ),
    "utf8",
  );
});

for (const variant of VARIANTS) {
  for (const region of REGIONS) {
    if (!CORE.includes(variant.name) && region.key !== "half") continue;

    test(`e15: ${variant.name} @ ${region.key}`, async ({ page }) => {
      const intrinsics = await openLab(page);
      const results: unknown[] = [];
      for (const emb of Object.keys(INTERPRETATIONS_BY_EMBEDDING) as EmbeddingMechanism[]) {
        const id = `${variant.name}|${region.key}|${emb}`;
        let innerSvgBox: { x: number; y: number; w: number; h: number } | null = null;
        if (emb === "svg-nested-attr" || emb === "svg-nested-region") {
          innerSvgBox = await page.evaluate((i) => (window as any).__e15.innerSvgBox(i), id);
        }
        if (emb === "object") {
          await page.waitForFunction((i) => (window as any).__e15.objectLoaded(i), id, { timeout: 8000 });
          innerSvgBox = await page.evaluate((i) => (window as any).__e15.innerSvgBox(i), id);
        }
        const png = await shootCell(page, id);
        results.push(classifyCell(variant.name, emb, region.key, png, innerSvgBox, intrinsics));
      }
      writeFileSync(
        resolve(EVIDENCE, `case-${variant.name.replace(/\.svg$/, "")}--${region.key}.json`),
        JSON.stringify({ variant: variant.name, region: region.key, fragment: region.fragment, cells: results }, null, 2),
        "utf8",
      );
    });
  }
}

test("e15: writes geometry matrix + summary and representative screenshots", async ({ page }) => {
  const intrinsics = await openLab(page);
  mkdirSync(SHOTS, { recursive: true });

  const shots: Array<[string, string]> = [
    ["e15-vb1000.svg|half|svg-nested-region", "vb1000-half-nested-region"],
    ["e15-vb1000.svg|half|svg-nested-attr", "vb1000-half-nested-attr"],
    ["e15-vb1000.svg|half|img-default", "vb1000-half-img-default"],
    ["e15-novb1000.svg|half|svg-nested-region", "novb1000-half-nested-region"],
    ["e15-novb1000.svg|half|svg-nested-attr", "novb1000-half-nested-attr"],
    ["e15-novb1000.svg|half|img-default", "novb1000-half-img-default"],
    ["e15-vb1000.svg|square500|img-fill", "vb1000-square500-img-fill"],
    ["e15-novb1000.svg|square500|img-fill", "novb1000-square500-img-fill"],
    ["e15-vb1000-slice.svg|half|svg-nested-region", "vb1000slice-half-nested-region"],
    ["e15-vb1000-none.svg|half|svg-nested-region", "vb1000none-half-nested-region"],
    ["e15-vb1000.svg|half|object", "vb1000-half-object"],
    ["e15-novb1000.svg|half|background", "novb1000-half-background"],
    ["e15-novb1920x1080.svg|half|img-contain", "novb169-half-img-contain"],
    ["e15-novb1920x1080.svg|half|img-none", "novb169-half-img-none"],
  ];
  for (const [id, name] of shots) {
    const el = page.locator(`[data-cell="${id}"]`);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: resolve(SHOTS, `${name}.png`), type: "png" });
  }

  // Assemble geometry matrix + summary from per-case files.
  const matrix: Record<string, Record<string, string>> = {};
  const summaryCells: Record<string, unknown> = {};
  for (const f of readdirSync(EVIDENCE).filter((f) => f.startsWith("case-") && f.endsWith(".json"))) {
    const data = JSON.parse(readFileSync(resolve(EVIDENCE, f), "utf8"));
    matrix[data.variant as string] ??= {};
    for (const cell of data.cells as any[]) {
      matrix[data.variant]![`${cell.embedding}@${data.region}`] =
        cell.matches.length === 1
          ? cell.matches[0]
          : cell.matches.length > 1
            ? `ambiguous(${cell.matches.join("==")})`
            : String(cell.verdict).toUpperCase();
      summaryCells[`${data.variant}|${cell.embedding}@${data.region}`] = {
        verdict: cell.verdict,
        matches: cell.matches,
      };
    }
  }
  writeFileSync(resolve(EVIDENCE, "geometry-matrix.json"), JSON.stringify(matrix, null, 2), "utf8");

  const readCase = (vn: string, rk: string) =>
    JSON.parse(readFileSync(resolve(EVIDENCE, `case-${vn.replace(/\.svg$/, "")}--${rk}.json`), "utf8"));

  // [NORMATIVE SVG 1.1 §7.7/§7.8] Region-as-viewport nested svg => viewBox
  // fits the region per preserveAspectRatio; no-viewBox => 1:1 from origin.
  for (const vn of [...CORE, ...VARIANTS.filter((v) => v.preserveAspectRatio).map((v) => v.name)]) {
    const uniqueRegions = vn.endsWith("-min.svg") || vn.endsWith("-slice.svg") || vn.endsWith("-none.svg") ? ["half"] : ["full", "half", "square500", "rect43"];
    for (const rk of uniqueRegions) {
      const cell = readCase(vn, rk).cells.find((c: any) => c.embedding === "svg-nested-region");
      expect(cell.matches, `${vn}@${rk} svg-nested-region`).toContain("I-REGION-VIEWPORT");
    }
  }
  // [NORMATIVE SVG 1.1 §7.9/§7.12] Attribute-mode nested svg: the body's own
  // width/height attributes establish its viewport at the region origin.
  for (const vn of CORE) {
    for (const rk of ["half", "square500", "rect43", "full"]) {
      const cell = readCase(vn, rk).cells.find((c: any) => c.embedding === "svg-nested-attr");
      expect(cell.matches, `${vn}@${rk} svg-nested-attr`).toContain("I-NATURAL-TOPLEFT");
    }
  }

  // [NORMATIVE CSS Images 3 §4.5] object-fit contain/none semantics.
  for (const [vn, emb, want] of [
    ["e15-novb1000.svg", "img-contain", "I-OBJECTFIT-CONTAIN"],
    ["e15-novb1920x1080.svg", "img-contain", "I-OBJECTFIT-CONTAIN"],
    ["e15-novb1000.svg", "img-none", "I-NATURAL-CENTERED"],
    ["e15-novb1920x1080.svg", "img-none", "I-NATURAL-CENTERED"],
  ] as const) {
    const cell = readCase(vn, "half").cells.find((c: any) => c.embedding === emb);
    expect(cell.matches, `${vn} ${emb}`).toContain(want);
  }
  // [NORMATIVE CSS Images 3 §4.3.1] background-size:auto with natural dims =>
  // natural size at the positioning-area origin.
  for (const vn of CORE) {
    const cell = readCase(vn, "half").cells.find((c: any) => c.embedding === "background");
    expect(cell.matches, `${vn} background`).toContain("I-NATURAL-TOPLEFT");
  }

  // Intrinsic size reporting follows SVG 1.1 §7.12 (width/height attributes).
  expect(intrinsics["e15-novb1000.svg"]).toEqual({ w: 1000, h: 1000 });
  expect(intrinsics["e15-vb1000.svg"]).toEqual({ w: 1000, h: 1000 });

  writeFileSync(
    resolve(EVIDENCE, "summary.json"),
    JSON.stringify(
      {
        experiment: "E15",
        question: "Is SVG painting geometry deterministic independently of the embedding mechanism?",
        browser: "Chromium (Playwright)",
        k: K,
        tolerances: { centerCanvasUnits: TOL_CENTER, radiusCanvasUnits: TOL_RADIUS },
        interpretations: INTERPRETATION_NAMES,
        intrinsics,
        cells: summaryCells,
      },
      null,
      2,
    ),
    "utf8",
  );
});
