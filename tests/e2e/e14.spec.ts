import { test, expect } from "@playwright/test";
import {
  gotoLab,
  seek,
  screenshotPng,
  px,
  canvasToCss,
  shot,
  record,
} from "./utils.ts";

/**
 * Experiment E14 — browser verification.
 *
 * The native renderer paints SVG bodies through `<img>`, i.e. the browser's
 * SVG-as-image pipeline. This spec empirically settles the E14 crux:
 *
 *   no-viewBox SVG painted into a differently-sized region
 *     - SVG-as-image reading (blind/native): user units map 1:1, clipped
 *       (SVG 1.1 §7.3/§7.8/§7.12; preserveAspectRatio ignored without viewBox).
 *     - Renderer A reading: synthesize a viewBox from width/height and fit.
 *
 * case06: e14-noviewbox-1000.svg (1000x1000, no viewBox) into region
 * xywh=480,270,960,540. Under 1:1 the circle centre lands at Canvas (980,770);
 * under the synthesized-viewBox "meet" it lands at (960,540) r~108.
 *
 * The test grid is near-black except a red crosshair at x=958..962 / y=538..542,
 * so red-dominance probes at (980,770) and (940,500) are unambiguous.
 */

async function e14Compare(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as any).__lab.e14Compare());
}

async function e14Resolved(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as any).__lab.e14Resolved());
}

async function imgMetrics(page: import("@playwright/test").Page, id: string) {
  return page.evaluate((i) => (window as any).__lab.imgMetrics(i), id);
}

/** Probe the rendered colour at a Canvas-space point. */
async function probeCanvas(
  page: import("@playwright/test").Page,
  cx: number,
  cy: number,
): Promise<[number, number, number]> {
  const css = await canvasToCss(page, cx, cy);
  const png = await screenshotPng(page);
  return px(png, css.x, css.y);
}

/** Wait until every native <img> overlay has loaded its resource. */
async function waitImgsLoaded(page: import("@playwright/test").Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.querySelectorAll(".native-overlay img"));
      return imgs.length > 0 && imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0);
    },
    null,
    { timeout: 10000 },
  );
}

const RED_DOMINANT = (c: [number, number, number]) => c[0]! - c[1]! > 100;
const NOT_RED = (c: [number, number, number]) => c[0]! - c[1]! < 60;

/**
 * case06 empirical result (recorded for the report):
 * Chrome's `<img>` pipeline applies CSS replaced-element sizing. With the
 * default object-fit: fill it STRETCHES the SVG's intrinsic canvas (1000x1000,
 * from width/height) into the region box (960x540), placing the circle centre
 * at Canvas (960,540). It does NOT map user units 1:1 from the region origin
 * (blind reading, which paints at (980,770)) — the SVG-as-image prediction is
 * falsified in the <img> embedding context. This is a VIEWER_GAP finding.
 */
test("e14: case06 native <img> scales the intrinsic canvas into the region (browser default)", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case06-a", renderer: "native", t: 5 });
  await seek(page, 5);
  await waitImgsLoaded(page);

  // Default object-fit: fill => circle centre lands at (960,540), not 1:1 (980,770).
  const nearCentre = await probeCanvas(page, 940, 500);
  const far = await probeCanvas(page, 980, 770);
  expect(RED_DOMINANT(nearCentre), `(940,500) should be red, got ${nearCentre}`).toBe(true);
  expect(NOT_RED(far), `(980,770) should be grid, got ${far}`).toBe(true);

  const ov = (await e14Resolved(page)).native.overlays.find((o: any) => o.kind === "svg")!;
  const box = await imgMetrics(page, ov.id);
  expect(box).not.toBeNull();
  // Intrinsic size reflects the SVG width/height attrs (1000x1000, §7.12).
  expect(box!.naturalW).toBe(1000);
  expect(box!.naturalH).toBe(1000);

  await shot(page, "e14/case06-native-img-default");
  record("e14-case06-native", {
    nearCentre: [...nearCentre],
    far: [...far],
    intrinsic: [box!.naturalW, box!.naturalH],
    finding: "SVG-as-image 1:1 prediction falsified under <img>; browser stretches intrinsic canvas into region (object-fit fill default)",
  });
});

test("e14: case06 blind nested-<svg> paints 1:1 (the SVG-as-image reading), disagreeing with <img>", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case06-a", renderer: "blind", t: 5 });
  await seek(page, 5);

  // Blind DOM: nested <svg> at the region with NO viewBox => 1:1 user units.
  const inside = await probeCanvas(page, 980, 770);
  const outside = await probeCanvas(page, 940, 500);
  expect(RED_DOMINANT(inside), `(980,770) should be red, got ${inside}`).toBe(true);
  expect(NOT_RED(outside), `(940,500) should be grid, got ${outside}`).toBe(true);

  await shot(page, "e14/case06-blind-1to1");
  record("e14-case06-blind", { inside: [...inside], outside: [...outside] });
});

test("e14: case06 renderer A synthesizes a viewBox and fits (different prediction)", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case06-a", renderer: "a", t: 5 });
  await seek(page, 5);

  // Synthesized viewBox meet => circle centre (960,540) r~108. (940,500) is
  // inside that circle; (980,770) is far outside.
  const nearCentre = await probeCanvas(page, 940, 500);
  const far = await probeCanvas(page, 980, 770);
  expect(RED_DOMINANT(nearCentre), `(940,500) should be red, got ${nearCentre}`).toBe(true);
  expect(NOT_RED(far), `(980,770) should be grid, got ${far}`).toBe(true);

  await shot(page, "e14/case06-a-synthesized-viewbox");
  record("e14-case06-a", { nearCentre: [...nearCentre], far: [...far] });
});

test("e14: case06 browser comparison matches the offline semantic verdict", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case06-a", renderer: "native", t: 5 });
  const cmp = await e14Compare(page);
  expect(cmp.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]);
  expect(cmp.overlayCount).toEqual({ a: 1, blind: 1, native: 1 });
});

test("e14: case01 temporal window holds for the native renderer", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case01-c", renderer: "native", t: 9 });
  await seek(page, 9);
  const at9 = await page.evaluate(() => (window as any).__lab.activeIds(9));
  expect(at9.length).toBe(0);
  await seek(page, 12);
  const at12 = await page.evaluate(() => (window as any).__lab.activeIds(12));
  expect(at12.length).toBe(1);
});

test("e14: case16 native renders unsafe SVG via <img> sandbox; blind rejects it", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case16-a", renderer: "native", t: 5 });
  const r = await e14Resolved(page);
  const unsafe = r.native.overlays.find((o: any) => o.id.includes("unsafe"))!;
  expect(unsafe.security.level).toBe("unsafe");
  expect(unsafe.security.decision).toBe("render"); // delegated to the <img> sandbox
  // The <img> element is present with the unsafe SVG as its src.
  const img = await page.evaluate((id) => {
    const el = document.querySelector(`[data-overlay-id="${id}"] img`);
    return el ? { src: el.getAttribute("src"), w: el.clientWidth, h: el.clientHeight } : null;
  }, unsafe.id);
  expect(img).not.toBeNull();
  expect(img!.src).toContain("e14-unsafe.svg");
  await shot(page, "e14/case16-native-sandbox");

  // Blind renderer rejects: decision reject, security.decision divergence.
  await gotoLab(page, { exp: "e14-case16-a", renderer: "blind", t: 5 });
  const cmp = await e14Compare(page);
  expect(cmp.verdicts).toEqual(["a!=blind", "a==native", "blind!=native"]);
});

test("e14: case14-b nested overlay canvas renders through the native <img> pipeline", async ({ page }) => {
  await gotoLab(page, { exp: "e14-case14-b", renderer: "native", t: 5 });
  const r = await e14Resolved(page);
  const nested = r.native.overlays.filter((o: any) => o.model === "B" && o.kind === "svg");
  expect(nested.length).toBe(1);
  await waitImgsLoaded(page);
  const box = await imgMetrics(page, nested[0]!.id);
  expect(box).not.toBeNull();
  // viewBox-only SVG: the browser derives intrinsic dims from the viewBox via
  // CSS default sizing (height 150, width from the 16:9 viewBox -> ~267x150).
  // Recorded, not asserted to a fixed value: browser-specific behavior.
  expect(box!.naturalW).toBeGreaterThan(0);
  record("e14-case14-b-native-intrinsic", {
    natural: [box!.naturalW, box!.naturalH],
    note: "Chrome intrinsic sizing for viewBox-only SVG (CSS images default sizing)",
  });
  const cmp = await e14Compare(page);
  expect(cmp.verdicts).toEqual(["a==blind", "a==native", "blind==native"]);
  await shot(page, "e14/case14-b-native");
});

test("e14: screenshots for representative native cases", async ({ page }) => {
  for (const [c, t] of [
    ["e14-case02-a", 5],
    ["e14-case09-a", 5],
    ["e14-case15-b", 5],
  ] as const) {
    await gotoLab(page, { exp: c, renderer: "native", t });
    await seek(page, t);
    await shot(page, `e14/${c}-native`);
  }
});