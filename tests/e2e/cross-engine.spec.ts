import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  VARIANTS,
  type EmbeddingMechanism,
  type LandmarkContract,
  type CanvasRect,
  type SvgVariant,
} from "../../src/embedding-semantics/analysis.ts";
import { makeClassifier, K } from "../../src/cross-engine/classify.ts";
import { fitMap } from "../../src/e16/comparison.ts";
import { gotoLab, seek, shot, waitFrames, canvasToCss, screenshotPng, px } from "./utils.ts";

/**
 * Experiment E17 — N1 cross-engine replication (Chromium / Firefox / WebKit).
 *
 * Minimal adversarial subset mandated by research/next-session-plan.md Stage 1:
 *  - E15 core geometry cells (explicit/no viewBox, square500/rect43/half,
 *    xMidYMin/xMinYMin/xMaxYMax/PAR-none, one slice-clipping family),
 *  - E16 nested-Canvas probes (same-aspect control, square & 4:3 mismatch,
 *    16:9-into-square strongest divergence, no-viewBox nesting, leaf-PAR
 *    collapse probes).
 *
 * Expected interpretations are IMMUTABLE (E15/E15-derived). Divergences are
 * recorded, never normalized away. Tolerances are E15-verbatim.
 */

const E17 = resolve("evidence", "e17");
const SHOTS = resolve(E17, "screenshots");

// Adversarial-but-minimal embedding set for existing-page cells.
const ENBS: EmbeddingMechanism[] = [
  "svg-nested-region",
  "img-default",
  "img-fill",
  "img-contain",
  "img-none",
  "object",
];

// Region-painting mechanisms whose explicit-viewBox agreement is hypothesis H1.
const REGION_PAINTING = new Set<EmbeddingMechanism>(["svg-nested-region", "img-default", "img-fill", "object"]);

// The xMaxYMax variant E15 never generated (landmark contract identical to
 // the e15 vb1000 family; see scripts/build-cross-engine-fixtures.mjs).
const MAX_VARIANT: SvgVariant = {
  name: "e17-vb1000-max.svg",
  viewBox: { minX: 0, minY: 0, w: 1000, h: 1000 },
  preserveAspectRatio: "xMaxYMax meet",
  width: 1000,
  height: 1000,
};

// Variant @ region pairs re-run from the existing /e15-lab.html matrix.
const PAIRS: Array<[string, string]> = [
  ["e15-vb1000.svg", "square500"], // same-aspect control
  ["e15-vb1920x1080.svg", "rect43"], // 16:9 body into 4:3 region
  ["e15-novb1000.svg", "square500"], // no-viewBox hazard
  ["e15-novb1920x1080.svg", "rect43"], // no-viewBox hazard
  ["e15-vb1000-min.svg", "half"], // xMinYMin
  ["e15-vb1000-none.svg", "half"], // PAR none
  ["e15-vb1000-slice.svg", "half"], // clipping case
];

function loadLandmarks(): Record<string, LandmarkContract> {
  const e15 = JSON.parse(readFileSync(resolve("public", "svg", "e15", "e15-landmarks.json"), "utf8")) as Record<
    string,
    LandmarkContract
  >;
  const e17 = JSON.parse(readFileSync(resolve("public", "svg", "e17", "e17-landmarks.json"), "utf8")) as Record<
    string,
    LandmarkContract
  >;
  return { ...e15, ...e17 };
}

let classifier: ReturnType<typeof makeClassifier> | null = null;
function classify(): ReturnType<typeof makeClassifier> {
  if (!classifier) {
    const regions: Array<{ key: string; fragment: string | null; rect: CanvasRect }> = [
      { key: "full", fragment: null, rect: { x: 0, y: 0, w: 1920, h: 1080 } },
      { key: "half", fragment: "xywh=480,270,960,540", rect: { x: 480, y: 270, w: 960, h: 540 } },
      { key: "square500", fragment: "xywh=710,290,500,500", rect: { x: 710, y: 290, w: 500, h: 500 } },
      { key: "rect43", fragment: "xywh=100,100,800,600", rect: { x: 100, y: 100, w: 800, h: 600 } },
    ];
    classifier = makeClassifier({
      variants: [...VARIANTS, MAX_VARIANT],
      regions,
      landmarks: loadLandmarks(),
    });
  }
  return classifier;
}

type Page_ = import("@playwright/test").Page;

async function openLab(
  page: Page_,
  url: string,
  apiName: "__e15" | "__e17",
): Promise<Record<string, { w: number; h: number }>> {
  await page.goto(url);
  await page.waitForFunction((n) => (window as any)[n] !== undefined, apiName, { timeout: 20000 });
  await page.evaluate((n) => (window as any)[n].ready(), apiName);
  return page.evaluate((n) => (window as any)[n].intrinsics(), apiName);
}

async function shootCell(page: Page_, id: string): Promise<PNG> {
  const el = page.locator(`[data-cell="${id}"]`);
  await el.scrollIntoViewIfNeeded();
  return PNG.sync.read(await el.screenshot({ type: "png" }));
}

/** Measure one cell of an /eXX-lab.html matrix page and return the record. */
async function measureCell(
  page: Page_,
  apiName: "__e15" | "__e17",
  variant: string,
  regionKey: string,
  emb: EmbeddingMechanism,
  intrinsics: Record<string, { w: number; h: number }>,
): Promise<ReturnType<ReturnType<typeof makeClassifier>>> {
  const id = `${variant}|${regionKey}|${emb}`;
  let innerSvgBox: { x: number; y: number; w: number; h: number } | null = null;
  if (emb === "svg-nested-region" || emb === "svg-nested-attr") {
    innerSvgBox = await page.evaluate(
      ([n, i]) => (window as any)[n].innerSvgBox(i),
      [apiName, id] as [string, string],
    );
  }
  if (emb === "object") {
    await page.waitForFunction(([n, i]) => (window as any)[n].objectLoaded(i), [apiName, id] as [string, string], {
      timeout: 8000,
    });
    innerSvgBox = await page.evaluate(
      ([n, i]) => (window as any)[n].innerSvgBox(i),
      [apiName, id] as [string, string],
    );
  }
  const png = await shootCell(page, id);
  return classify()(variant, emb, regionKey, png, innerSvgBox, intrinsics);
}

async function writeCase(engine: string, name: string, data: Record<string, unknown>): Promise<void> {
  mkdirSync(E17, { recursive: true });
  writeFileSync(resolve(E17, name.replace("<engine>", engine)), JSON.stringify(data, null, 2), "utf8");
}

test.describe.configure({ mode: "serial" });

// ---------------------------------------------------------------------------
// Representative case (execution-order step C): explicit-viewBox square body
// into the aspect-mismatched 4:3 region — exercises xMidYMid centering across
// every region-painting mechanism family.
// ---------------------------------------------------------------------------
test("e17 rep: vb1000 @ rect43 across mechanisms [all engines]", async ({ page, browser }) => {
  const engine = test.info().project.name;
  mkdirSync(resolve(SHOTS, engine), { recursive: true });

  const intrinsics = await openLab(page, "/e15-lab.html", "__e15");
  const userAgent = await page.evaluate(() => navigator.userAgent);

  const cells: ReturnType<ReturnType<typeof makeClassifier>>[] = [];
  for (const emb of ENBS) {
    cells.push(await measureCell(page, "__e15", "e15-vb1000.svg", "rect43", emb, intrinsics));
    const el = page.locator(`[data-cell="e15-vb1000.svg|rect43|${emb}"]`);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: resolve(SHOTS, engine, `rep-vb1000-rect43-${emb}.png`), type: "png" });
  }

  // Spec-truth assertion (SVG 1.1 §7.7/§7.8): region-as-viewport nested svg
  // must fit the viewBox per preserveAspectRatio in EVERY engine.
  const nested = cells.find((c) => c.embedding === "svg-nested-region")!;
  expect(nested.matches, "svg-nested-region must realize I-REGION-VIEWPORT").toContain("I-REGION-VIEWPORT");

  writeCase(engine, `case-e15-<engine>-vb1000--rect43.json`, {
    experiment: "E17/N1 cross-engine replication",
    meta: { engine, browserVersion: browser.version(), userAgent },
    fixture: "e15-vb1000.svg",
    region: "rect43",
    fragment: "xywh=100,100,800,600",
    k: K,
    tolerances: "E15 verbatim: coverage >= 0.8 on circle AND frame masks",
    expectedNote:
      "I-REGION-VIEWPORT predicted for nested/img-default/img-fill/object; I-OBJECTFIT-CONTAIN for img-contain; I-NATURAL-CENTERED for img-none",
    cells,
  });
});

// ---------------------------------------------------------------------------
// E15 core-matrix subset (H1/H2/H3 evidence).
// ---------------------------------------------------------------------------
for (const [variantName, regionKey] of PAIRS) {
  test(`e17 e15: ${variantName} @ ${regionKey} [all engines]`, async ({ page, browser }) => {
    const engine = test.info().project.name;
    const intrinsics = await openLab(page, "/e15-lab.html", "__e15");
    const userAgent = await page.evaluate(() => navigator.userAgent);

    const cells: ReturnType<ReturnType<typeof makeClassifier>>[] = [];
    for (const emb of ENBS) {
      cells.push(await measureCell(page, "__e15", variantName, regionKey, emb, intrinsics));
    }
    // One representative screenshot per pair (nested-region reference cell).
    const refId = `${variantName}|${regionKey}|svg-nested-region`;
    const el = page.locator(`[data-cell="${refId}"]`);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: resolve(SHOTS, engine, `${variantName}-${regionKey}-nested-region.png`), type: "png" });

    // H1 (immutable expectation): every explicit-viewBox region-painting cell
    // must realize I-REGION-VIEWPORT in EVERY engine. A failure here is an
    // S1.1 finding, never a threshold adjustment.
    const isNovb = variantName.includes("novb");
    if (!isNovb) {
      for (const cell of cells) {
        if (REGION_PAINTING.has(cell.embedding)) {
          expect(
            cell.matches,
            `${cell.embedding} must realize I-REGION-VIEWPORT for ${variantName}@${regionKey}`,
          ).toContain("I-REGION-VIEWPORT");
        }
      }
    }

    writeCase(engine, `case-e15-<engine>-${variantName.replace(/^e15-|\.svg$/g, "")}--${regionKey}.json`, {
      experiment: "E17/N1 cross-engine replication",
      meta: { engine, browserVersion: browser.version(), userAgent },
      fixture: variantName,
      region: regionKey,
      fragment: regionKey === "half" ? "xywh=480,270,960,540" : regionKey === "square500" ? "xywh=710,290,500,500" : "xywh=100,100,800,600",
      k: K,
      tolerances: "E15 verbatim: coverage >= 0.8 on circle AND frame masks",
      cells,
    });
  });
}

// ---------------------------------------------------------------------------
// xMaxYMax variant cells (/e17-lab.html).
// ---------------------------------------------------------------------------
for (const regionKey of ["half", "rect43"]) {
  test(`e17 max: e17-vb1000-max.svg @ ${regionKey} [all engines]`, async ({ page, browser }) => {
    const engine = test.info().project.name;
    const intrinsics = await openLab(page, "/e17-lab.html", "__e17");
    const userAgent = await page.evaluate(() => navigator.userAgent);

    const cells: ReturnType<ReturnType<typeof makeClassifier>>[] = [];
    for (const emb of [...ENBS, "svg-nested-attr" as EmbeddingMechanism]) {
      cells.push(await measureCell(page, "__e17", "e17-vb1000-max.svg", regionKey, emb, intrinsics));
    }
    const el = page.locator(`[data-cell="e17-vb1000-max.svg|${regionKey}|svg-nested-region"]`);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: resolve(SHOTS, engine, `max-${regionKey}-nested-region.png`), type: "png" });

    for (const cell of cells) {
      if (REGION_PAINTING.has(cell.embedding)) {
        expect(cell.matches, `xMaxYMax ${cell.embedding}@${regionKey}`).toContain("I-REGION-VIEWPORT");
      }
    }

    writeCase(engine, `case-max-<engine>--${regionKey}.json`, {
      experiment: "E17/N1 cross-engine replication",
      meta: { engine, browserVersion: browser.version(), userAgent },
      fixture: "e17-vb1000-max.svg",
      region: regionKey,
      fragment: regionKey === "half" ? "xywh=480,270,960,540" : "xywh=100,100,800,600",
      k: K,
      tolerances: "E15 verbatim: coverage >= 0.8 on circle AND frame masks",
      cells,
    });
  });
}

// ---------------------------------------------------------------------------
// Intrinsic-size probes (Q1.2 input evidence — raw values, never normalized).
// ---------------------------------------------------------------------------
test("e17 intrinsics: browser-reported SVG intrinsic sizes [all engines]", async ({ page, browser }) => {
  const engine = test.info().project.name;
  const userAgent = await page.goto("/e15-lab.html").then(() => page.evaluate(() => navigator.userAgent));
  await page.waitForFunction(() => (window as any).__e15 !== undefined, null, { timeout: 20000 });
  const e15 = await page.evaluate(() => (window as any).__e15.intrinsics());
  await page.goto("/e17-lab.html");
  await page.waitForFunction(() => (window as any).__e17 !== undefined, null, { timeout: 20000 });
  const e17 = await page.evaluate(() => (window as any).__e17.intrinsics());

  writeCase(engine, `intrinsics-<engine>.json`, {
    experiment: "E17/N1 cross-engine replication",
    meta: { engine, browserVersion: browser.version(), userAgent },
    note: "Raw <img>.naturalWidth/naturalHeight per SVG variant. Expected divergence surface: attribute-less SVG (SVG 1.1 §7.12 vs SVG 2 intrinsic sizing). Values are recorded verbatim.",
    e15Variants: e15,
    e17Variants: e17,
  });
});

// ---------------------------------------------------------------------------
// E16 cross-engine probes (main lab page, native <img> channel).
// ---------------------------------------------------------------------------

/** Wait until every native <img> overlay has loaded AND painted its resource. */
async function waitImgsLoaded(page: Page_): Promise<void> {
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".native-overlay img"));
      return imgs.length > 0 && imgs.every((i) => i.naturalWidth > 0 && i.complete);
    },
    null,
    { timeout: 10000 },
  );
  await waitFrames(page, 6);
}

const MAGENTA = (c: [number, number, number]) => c[0]! > 140 && c[2]! > 140 && c[1]! < 110;

/** True when any pixel within `r` css px of the Canvas point satisfies pred. */
async function probeNear(page: Page_, cx: number, cy: number, r: number, pred: (c: [number, number, number]) => boolean): Promise<boolean> {
  const css = await canvasToCss(page, cx, cy);
  const png = await screenshotPng(page);
  const x0 = Math.round(css.x);
  const y0 = Math.round(css.y);
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const xi = Math.max(0, Math.min(png.width - 1, x0 + dx));
      const yi = Math.max(0, Math.min(png.height - 1, y0 + dy));
      const i = (png.width * yi + xi) * 4;
      if (pred([png.data[i]!, png.data[i + 1]!, png.data[i + 2]!])) return true;
    }
  return false;
}

/** Scan one Canvas-space row for colour runs matching pred; run centres as fractions of content width. */
async function scanRowRuns(page: Page_, canvasY: number, pred: (c: [number, number, number]) => boolean): Promise<number[]> {
  const left = await canvasToCss(page, 0, canvasY);
  const right = await canvasToCss(page, 1920, canvasY);
  const png = await screenshotPng(page);
  const y = Math.round(left.y);
  const w = right.x - left.x;
  const centres: number[] = [];
  let start = -1;
  for (let x = Math.max(0, Math.round(left.x) - 2); x <= Math.min(png.width - 1, Math.round(right.x) + 2); x++) {
    const i = (png.width * y + x) * 4;
    const hit = pred([png.data[i]!, png.data[i + 1]!, png.data[i + 2]!]);
    if (hit && start === -1) start = x;
    if (!hit && start !== -1) {
      if (x - start >= 2) centres.push((start + x - 1) / 2);
      start = -1;
    }
  }
  return centres.map((c) => (c - left.x) / w);
}

async function compareVerdicts(page: Page_): Promise<string[]> {
  const cmp = await page.evaluate(() => (window as any).__lab.e14Compare());
  return cmp.verdicts as string[];
}

test("e17 e16 case01: same-aspect control [native]", async ({ page }) => {
  const engine = test.info().project.name;
  await gotoLab(page, { exp: "e16-case01-same-full-b", renderer: "native", t: 5 });
  await seek(page, 5);
  await waitImgsLoaded(page);

  const verdicts = await compareVerdicts(page);
  const runs = await scanRowRuns(page, 300, MAGENTA);
  const fill = fitMap(1920, 1080, { x: 0, y: 0, w: 1920, h: 1080 }, "fill");
  const contain = fitMap(1920, 1080, { x: 0, y: 0, w: 1920, h: 1080 }, "contain");
  await shot(page, `e17/${engine}-case01-native`);

  writeCase(engine, `e16-<engine>-case01-control.json`, {
    experiment: "E17/N1 cross-engine replication",
    engine,
    case: "case01-same-full-b (inner 1920x1080 onto full 1920x1080)",
    expectedNote:
      "Same-aspect composition: fill and coincide analytically; composed bands should sit at the identity-mapped frame positions regardless of fit reading.",
    analytic: { fitsCoincide: true, fillScaleX: fill.scaleX, fillScaleY: fill.scaleY, containScale: contain.scaleX },
    verdicts,
    magentaRunsRowY300Fractions: runs,
  });
});

test("e17 e16 case03: leaf-PAR collapse probes [native]", async ({ page }) => {
  const engine = test.info().project.name;
  await gotoLab(page, { exp: "e16-case03-sq-full-b", renderer: "native", t: 5 });
  await seek(page, 5);
  await waitImgsLoaded(page);

  const verdicts = await compareVerdicts(page);
  // Verbatim Chromium-established probe points (e16.spec.ts):
  //   (38,540): novb layer stretched to destination (two-stage fill realized)
  //   (441,540): vb leaf letterbox INSIDE fill-mapped container (collapse)
  const novbBand = await probeNear(page, 38, 540, 5, MAGENTA);
  const collapsedBand = await probeNear(page, 441, 540, 5, MAGENTA);
  await shot(page, `e17/${engine}-case03-native`);

  writeCase(engine, `e16-<engine>-case03-collapse.json`, {
    experiment: "E17/N1 cross-engine replication",
    engine,
    case: "case03-sq-full-b (inner 1000x1000 onto full 1920x1080)",
    expectedNote:
      "Chromium truth (E16): novbBand=true (intrinsic stretch), collapsedBand=true (leaf preserveAspectRatio applied against DESTINATION aspect inside fill-mapped container). A false value in another engine is a recorded cross-engine divergence ([BROWSER]), never normalized.",
    verdicts,
    probes: { novbStretchedBandNearCanvas38: novbBand, leafParCollapsedBandNearCanvas441: collapsedBand },
  });
});

test("e17 e16 case05: fill vs leaf-PAR landmark separation [native]", async ({ page }) => {
  const engine = test.info().project.name;
  await gotoLab(page, { exp: "e16-case05-43-full-b", renderer: "native", t: 5 });
  await waitImgsLoaded(page);
  // Harness fix (lab bug #16): Firefox paints loaded overlays later than
  // Chromium; re-apply the target time AFTER image load so the rasterized
  // state is deterministic in every engine. Measurement-order fix only.
  await seek(page, 5);
  await waitFrames(page, 6);

  let runs = await scanRowRuns(page, 300, MAGENTA);
  let frameRuns = runs.filter((fr) => fr < 0.4);
  if (frameRuns.length < 2) {
    await waitFrames(page, 12);
    runs = await scanRowRuns(page, 300, MAGENTA);
    frameRuns.push(...runs.filter((fr) => fr < 0.4));
  }
  await shot(page, `e17/${engine}-case05-native`);

  writeCase(engine, `e16-<engine>-case05-separation.json`, {
    experiment: "E17/N1 cross-engine replication",
    engine,
    case: "case05-43-full-b (inner 640x480 onto full 1920x1080)",
    expectedNote:
      "Chromium truth (E16): two left-side vertical bands — novb stretched near fraction <0.06; leaf-PAR collapsed band near 0.08–0.22. Recorded per engine; divergence is data.",
    allRuns: runs,
    leftFrameRuns: frameRuns,
    chromiumReferenceFlags: {
      novbStretchedBelow0_06: frameRuns[0] !== undefined ? frameRuns[0] < 0.06 : null,
      collapsedBandIn0_08to0_22: frameRuns[1] !== undefined ? frameRuns[1] > 0.08 && frameRuns[1] < 0.22 : null,
    },
  });
});

test("e17 e16 case06: strongest divergence (169 into square) [native]", async ({ page }) => {
  const engine = test.info().project.name;
  await gotoLab(page, { exp: "e16-case06-169into-sq-b", renderer: "native", t: 5 });
  await seek(page, 5);
  await waitImgsLoaded(page);

  const resolved = await page.evaluate(() => (window as any).__lab.e14Resolved());
  const nestedPlacements = (resolved.native.overlays as any[])
    .filter((o) => o.kind === "svg")
    .map((o) => ({ mode: o.placement?.mode ?? null, nested: o.placement?.nested ?? null }));

  // Composite-resource intrinsic sizes as reported by THIS engine (<img> channel).
  const imgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>(".native-overlay img")).map((i) => ({
      naturalWidth: i.naturalWidth,
      naturalHeight: i.naturalHeight,
    })),
  );

  const fill = fitMap(1920, 1080, { x: 710, y: 290, w: 500, h: 500 }, "fill");
  const contain = fitMap(1920, 1080, { x: 710, y: 290, w: 500, h: 500 }, "contain");
  await shot(page, `e17/${engine}-case06-native`);

  writeCase(engine, `e16-<engine>-case06-fit.json`, {
    experiment: "E17/N1 cross-engine replication",
    engine,
    case: "case06-169into-sq-b (inner 1920x1080 onto xywh=710,290,500,500)",
    expectedNote:
      "Strongest fill/contain divergence case (up to ~386 Canvas units). Raster band-probing is unreliable here (down-scaled strokes are sub-pixel at K=0.25), so this records resolver-level placements + composite <img> intrinsic size per engine; screenshots archived for visual comparison.",
    analyticPredictions: { fill: { scaleX: fill.scaleX, scaleY: fill.scaleY }, contain: { scaleX: contain.scaleX, scaleY: contain.scaleY } },
    resolverNestedPlacements: nestedPlacements,
    compositeImgIntrinsicSizes: imgs,
  });
});

test("e17 e16 case07: no-viewBox divergence preserved [blind + A]", async ({ page }) => {
  const engine = test.info().project.name;

  await gotoLab(page, { exp: "e16-case07-novb-b", renderer: "blind", t: 5 });
  const blindVerdicts = await compareVerdicts(page);
  await shot(page, `e17/${engine}-case07-blind`);

  await gotoLab(page, { exp: "e16-case07-novb-b", renderer: "a", t: 5 });
  const aVerdicts = await compareVerdicts(page);
  await shot(page, `e17/${engine}-case07-a`);

  // Designed OPEN divergence (A synthesizes viewBox; blind maps 1:1) must be
  // preserved by BOTH resolvers in every engine.
  expect(blindVerdicts, "blind resolver divergence set").toEqual(["a!=blind", "a!=native", "blind==native"]);
  expect(aVerdicts, "renderer-A divergence set").toEqual(["a!=blind", "a!=native", "blind==native"]);

  writeCase(engine, `e16-<engine>-case07-verdicts.json`, {
    experiment: "E17/N1 cross-engine replication",
    engine,
    case: "case07-novb-b (no-viewBox body inside nested Canvas)",
    expectedNote: "Designed divergence preserved: a!=blind, a!=native, blind==native.",
    blindVerdicts,
    rendererAVerdicts: aVerdicts,
  });
});
