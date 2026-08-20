import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, rectCenterCanvas, shot, record } from "./utils.ts";

/**
 * Experiment 4 — spatial targeting (`#xywh=` and combined `xywh&t=`).
 *
 * The interpretation under test: an SVG body targeted at a Canvas region is
 * "painted into" that region (the browser maps the body's viewport onto the
 * region). Renderer B bakes the same graphics at the absolute Canvas position,
 * so A == B (by geometry) is the falsification check for the interpretation.
 */
const REGIONS = [
  { name: "region-00", overlaySub: "region-circles", t: 12, active: true, canvasPt: [480, 270] as const },
  { name: "region-960540", overlaySub: "region-circles-t", t: 12, active: true, canvasPt: [1440, 810] as const },
  { name: "region-pct", overlaySub: "region-pct", t: 12, active: true, canvasPt: [1200, 135] as const },
  { name: "region-timed", overlaySub: "region-timed", t: 12, active: true, canvasPt: [480, 810] as const },
  { name: "region-timed-hidden", overlaySub: "region-timed", t: 5, active: false, canvasPt: [480, 810] as const },
];

test("exp4: renderer A xywh region == renderer B baked-position geometry", async ({ page }) => {
  const observations: Record<string, unknown> = {};

  for (const region of REGIONS) {
    const gA: { center: { x: number; y: number }; region: { x: number; y: number; width: number; height: number } } = await (async () => {
      await gotoLab(page, { exp: "4", renderer: "a", t: region.t });
      const snap = await snapshot(page);
      const e = snap.find((x) => x.id.includes(region.overlaySub))!;
      expect(e, `${region.overlaySub} present in renderer A`).toBeDefined();
      expect(e.visible, `${region.overlaySub} visibility @${region.t}s`).toBe(region.active);
      const circle = e.shapes.find((s) => s.tag === "circle")!;
      const center = await rectCenterCanvas(page, circle.rect);
      return { center, region: e.region };
    })();

    const gB: { center: { x: number; y: number }; region: { x: number; y: number; width: number; height: number } } = await (async () => {
      await gotoLab(page, { exp: "4", renderer: "b", t: region.t });
      const snap = await snapshot(page);
      const e = snap.find((x) => x.id.includes(region.overlaySub)) ?? snap[REGIONS.indexOf(region)]!;
      expect(e, `${region.overlaySub} present in renderer B`).toBeDefined();
      expect(e.visible, `renderer B ${region.overlaySub} visibility @${region.t}s`).toBe(region.active);
      const circle = e.shapes.find((s) => s.tag === "circle")!;
      const center = await rectCenterCanvas(page, circle.rect);
      return { center, region: e.region };
    })();

    const dx = Math.abs(gA.center.x - gB.center.x);
    const dy = Math.abs(gA.center.y - gB.center.y);
    observations[region.name] = {
      t: region.t,
      rendererA: { circleCenterCanvas: gA.center },
      rendererB: { circleCenterCanvas: gB.center },
      canvasPt: region.canvasPt,
      delta: { dx, dy },
    };
    if (region.active) {
      expect(dx, `${region.name} A/B x-offset in canvas units`).toBeLessThan(2.5);
      expect(dy, `${region.name} A/B y-offset in canvas units`).toBeLessThan(2.5);
      // Also confirm the interpretation lands the circle where the manifest says.
      expect(Math.abs(gA.center.x - region.canvasPt[0])).toBeLessThan(2.5);
      expect(Math.abs(gA.center.y - region.canvasPt[1])).toBeLessThan(2.5);
    }
  }

  await gotoLab(page, { exp: "4", renderer: "a", t: 12 });
  await shot(page, "exp4/exp4-rendererA");
  await gotoLab(page, { exp: "4", renderer: "b", t: 12 });
  await shot(page, "exp4/exp4-rendererB");

  record("exp4", observations);
});