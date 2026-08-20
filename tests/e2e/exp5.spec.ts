import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, rectCenterCanvas, shot, record } from "./utils.ts";

/**
 * Experiment 5 — coordinate systems. Same circle, three viewBoxes, painted into
 * the full canvas. Question: must a profile require SVG user space == Canvas
 * coordinate space?
 */
const CASES = [
  { exp: "5a", viewBox: "0 0 1920 1080", label: "A: 1920x1080" },
  { exp: "5b", viewBox: "0 0 1000 1000", label: "B: 1000x1000" },
  { exp: "5c", viewBox: "0 0 64 36", label: "C: 64x36" },
] as const;

test("exp5: viewBox drives physical mapping; only 1920x1080 is lossless", async ({ page }) => {
  const observations: Record<string, unknown> = {};

  for (const c of CASES) {
    await gotoLab(page, { exp: c.exp });
    await seek(page, 5);
    const snap = await snapshot(page);
    const e = snap.find((x) => x.shapes.some((s) => s.tag === "circle"))!;
    const circle = e.shapes.find((s) => s.tag === "circle")!;
    const center = await rectCenterCanvas(page, circle.rect);

    // Radius in Canvas units: measure css width, then scale by canvas width.
    const dims = await page.evaluate(() => {
      const v = document.querySelector("#stage-root svg.overlay") as SVGSVGElement;
      const r = v.getBoundingClientRect();
      return { cssW: r.width, cssH: r.height };
    });
    const radiusCanvas = (circle.rect.width / dims.cssW) * 1920 / 2;

    // Predicted placement (drift-free oracle, same math as the renderer).
    const predicted = await page.evaluate(
      ([cx, cy]) => (window as any).__lab.toCanvasPoint(cx, cy),
      [circle.rect.x + circle.rect.width / 2, circle.rect.y + circle.rect.height / 2] as [number, number],
    );

    observations[c.exp] = {
      label: c.label,
      centerCanvas: center,
      radiusCanvas,
      predictedCenter: predicted,
      driftsFromCenterOfCanvas: { x: center.x - 960, y: center.y - 540 },
    };
    await shot(page, `exp5/${c.exp}-viewbox`);
    await expect(page).toHaveTitle(/Video Annotation/);
  }

  const a = observations["5a"] as any;
  const b = observations["5b"] as any;
  const cc = observations["5c"] as any;

  // Case A: exact fit, no drift.
  expect(Math.abs(a.centerCanvas.x - 960)).toBeLessThan(1);
  expect(Math.abs(a.centerCanvas.y - 540)).toBeLessThan(1);
  expect(a.radiusCanvas).toBeCloseTo(200, 0);

  // Case B (1000x1000 in 16:9 region): uniform 'meet' scale 1080/1000=1.08,
  // so the circle is magnified and its centre drifts vertically.
  expect(b.radiusCanvas).toBeGreaterThan(200);
  expect(b.centerCanvas.y).toBeGreaterThan(540);

  // Case C (64x36 in 1920x1080): scale 30, radius 210, centre pinned.
  expect(cc.radiusCanvas).toBeCloseTo(210, 0);
  expect(Math.abs(cc.centerCanvas.x - 960)).toBeLessThan(1);
  expect(Math.abs(cc.centerCanvas.y - 540)).toBeLessThan(1);

  record("exp5", observations);
});