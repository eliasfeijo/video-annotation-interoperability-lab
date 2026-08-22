import { test, expect } from "@playwright/test";
import { gotoLab, seek, shot, record, canvasToCss, screenshotPng, px, waitFrames } from "./utils.ts";

/**
 * Experiment E16 — browser verification of nested-Canvas composition.
 *
 * The native stage implements the FILL reading of the IIIF 4.0 draft's
 * "scaled to fit that region" (the reading E14 already exercised). These
 * tests verify the composed geometry pixel-wise for an aspect-mismatched
 * case (square inner Canvas -> 16:9 region), record where the CONTAIN reading
 * would have painted (demonstrating the draft's ambiguity is observable),
 * and verify the no-viewBox divergence survives nesting.
 */

async function e16Resolved(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as any).__lab.e14Resolved());
}

const MAGENTA = (c: [number, number, number]) => c[0]! > 140 && c[2]! > 140 && c[1]! < 110;

/** Wait until every native <img> overlay has loaded AND painted its resource. */
async function waitImgsLoaded(page: import("@playwright/test").Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".native-overlay img"));
      return imgs.length > 0 && imgs.every((i) => i.naturalWidth > 0 && i.complete);
    },
    null,
    { timeout: 10000 },
  );
  // Give the compositor a few frames to actually rasterize the decoded images.
  await waitFrames(page, 6);
}

/** Probe rendered colour at a Canvas-space point on the current page. */
async function probeCanvas(page: import("@playwright/test").Page, cx: number, cy: number) {
  const css = await canvasToCss(page, cx, cy);
  const png = await screenshotPng(page);
  return px(png, css.x, css.y);
}

/** True when any pixel within `r` css px of the Canvas point satisfies pred. */
async function probeNear(
  page: import("@playwright/test").Page,
  cx: number,
  cy: number,
  r: number,
  pred: (c: [number, number, number]) => boolean,
): Promise<boolean> {
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

test("e16 case03 (square inner -> full 16:9 outer): fill geometry verified in-browser", async ({ page }) => {
  await gotoLab(page, { exp: "e16-case03-sq-full-b", renderer: "native", t: 5 });
  await seek(page, 5);
  await waitImgsLoaded(page);

  // RESOLVER contract (fill reading): inner canvas stretched to the region.
  const r = await e16Resolved(page);
  const cmp = await page.evaluate(() => (window as any).__lab.e14Compare());
  expect(cmp.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]); // designed novb divergence only
  const nested = r.native.overlays.filter((o: any) => o.kind === "svg");
  expect(nested.length).toBe(2);
  expect(nested[0]!.placement.nested).toBeDefined();
  expect(nested[0]!.placement.nested.scaleX).toBeCloseTo(1.92, 6);
  expect(nested[0]!.placement.nested.scaleY).toBeCloseTo(1.08, 6);

  // BROWSER truth (native <img> channel), measured:
  //  - novb body (no viewBox): intrinsic canvas bitmap-stretched to the
  //    destination -> frame bands at canvas x ~30..46 and ~1874..1889. The
  //    two-stage fill composition IS realized for this body.
  const novbBand = await probeNear(page, 38, 540, 5, MAGENTA);
  expect(novbBand, "novb stretched frame near (38,540)").toBe(true);

  //  - viewBox body: the browser collapses the composition into ONE stage —
  //    the leaf SVG's preserveAspectRatio is applied against the DESTINATION
  //    aspect (16:9), so the square viewBox letterboxes INSIDE the region
  //    (bands at ~437..446 and ~1478..1487) even though the container was
  //    fill-stretched. The draft does not define this interaction:
  //    [OPEN] container-fit vs leaf-PAR precedence, now measured.
  const collapsedBand = await probeNear(page, 441, 540, 5, MAGENTA);
  expect(collapsedBand, "leaf-PAR collapsed frame near (441,540)").toBe(true);

  await shot(page, "e16/case03-fill-native");
  record("e16-case03-fill-probes", {
    novbStretchedBandNear: novbBand,
    leafParCollapsedBandNear: collapsedBand,
    finding:
      "Browser <img> channel applies leaf preserveAspectRatio against the destination aspect inside a fill-mapped nested Canvas: container-fit and leaf-PAR collapse into one stage. Draft is silent on precedence -> OPEN.",
  });
});

/**
 * Scan one Canvas-space row for colour runs matching pred; returns run
 * centres as FRACTIONS of the content-box width (robust against global
 * letterbox scaling differences between runs).
 */
async function scanRowRuns(
  page: import("@playwright/test").Page,
  canvasY: number,
  pred: (c: [number, number, number]) => boolean,
): Promise<number[]> {
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
  const fractions = centres.map((c) => (c - left.x) / w);
  if (fractions.length === 0) {
    const samples: string[] = [];
    for (let dx = 0; dx < w; dx += Math.max(1, Math.floor(w / 24))) {
      const i = (png.width * y + (Math.round(left.x) + dx)) * 4;
      samples.push(`${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`);
    }
    console.log("SCANDBG", JSON.stringify({ y, leftX: left.x, w, samples }));
  }
  return fractions;
}

test("e16 case05 (4:3 inner -> full outer): fill vs leaf-PAR landmark separation recorded", async ({ page }) => {
  await gotoLab(page, { exp: "e16-case05-43-full-b", renderer: "native", t: 5 });
  await waitImgsLoaded(page);
  // Row through canvas y=300 crosses BOTH vertical frame bands:
  //   novb layer (bitmap-stretched intrinsic): left band ~ canvas x 30..46
  //     -> fraction ~0.02
  //   vb 640x480 layer (leaf PAR meet inside the fill-mapped img): drawn
  //     centred, width 1440 -> left band ~ canvas x 276..294 -> fraction ~0.15
  // (identical to where a CONTAIN composition would put it)
  const runs = await scanRowRuns(page, 300, MAGENTA);
  const frameRuns = runs.filter((fr) => fr < 0.4); // left-side verticals only
  if (frameRuns.length < 2) {
    // Decode/paint race fallback: give it more frames and re-scan once.
    await waitFrames(page, 12);
    const retry = await scanRowRuns(page, 300, MAGENTA);
    frameRuns.push(...retry.filter((fr) => fr < 0.4));
  }
  expect(frameRuns.length, `two left-side frame bands, got ${JSON.stringify(runs)}`).toBeGreaterThanOrEqual(2);
  expect(frameRuns[0]!, "novb stretched band near left edge").toBeLessThan(0.06);
  expect(frameRuns[1]!, "leaf-PAR collapsed band near 0.15").toBeGreaterThan(0.08);
  expect(frameRuns[1]!, "leaf-PAR collapsed band near 0.15").toBeLessThan(0.22);
  record("e16-case05-fit-separation", { leftFrameRunFractions: frameRuns });
  await shot(page, "e16/case05-native");
});

test("e16 case07: no-viewBox divergence inside a nested Canvas (A vs blind)", async ({ page }) => {
  await gotoLab(page, { exp: "e16-case07-novb-b", renderer: "blind", t: 5 });
  const cmpBlind = await page.evaluate(() => (window as any).__lab.e14Compare());
  expect(cmpBlind.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]);
  await shot(page, "e16/case07-blind-novb");

  await gotoLab(page, { exp: "e16-case07-novb-b", renderer: "a", t: 5 });
  await shot(page, "e16/case07-a-novb");
});

test("e16 case08: temporal target windows the whole nested overlay", async ({ page }) => {
  await gotoLab(page, { exp: "e16-case08-temporal-b", renderer: "a", t: 9 });
  await seek(page, 9);
  expect(await page.evaluate(() => (window as any).__lab.activeIds(9))).toHaveLength(0);
  await seek(page, 12);
  expect((await page.evaluate(() => (window as any).__lab.activeIds(12))).length).toBeGreaterThan(0);
});

test("e16 screenshots: representative cases", async ({ page }) => {
  for (const [c, t] of [
    ["e16-case01-same-full-b", 5],
    ["e16-case02-same-reg-b", 5],
    ["e16-case04-sq-reg-b", 5],
    ["e16-case06-169into-sq-b", 5],
    ["e16-case03-sq-full-a", 5],
    ["e16-case06-169into-sq-a", 5],
  ] as const) {
    await gotoLab(page, { exp: c, renderer: "a", t });
    await seek(page, t);
    await shot(page, `e16/${c}-rendererA`);
  }
});
