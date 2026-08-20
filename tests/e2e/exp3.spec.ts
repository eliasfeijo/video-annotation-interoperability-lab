import { test, expect } from "@playwright/test";
import {
  gotoLab, seek, canvasToCss, screenshotPng, px, close, shot, record,
} from "./utils.ts";

/**
 * Experiment 3 — multiple painting annotations / layering.
 * Order in the AnnotationPage (rect < circle < arrow < text) is the z-order:
 * later items paint on top.
 */
test("exp3: annotation page order acts as z-order", async ({ page }) => {
  await gotoLab(page, { exp: "3" });
  await seek(page, 6);

  // Robust probes: (1) rect interior away from grid lines; (2) circle centre,
  // overlapping the rect; (3) dead centre of the arrow stroke. Expectations are
  // BLENDED colours: translucent fills composite over the dark video.
  const probes = [
    { name: "rect-only", canvas: [300, 220], expect: [149, 123, 9], tol: 65 },
    { name: "circle-over-rect", canvas: [500, 380], expect: [181, 18, 17], tol: 65 },
    { name: "arrow-mid", canvas: [950, 225], expect: [0, 187, 0], tol: 40 },
  ] as const;

  const observations: Record<string, unknown> = {};
  const png = await screenshotPng(page);
  for (const probe of probes) {
    const css = await canvasToCss(page, probe.canvas[0], probe.canvas[1]);
    const actual = px(png, css.x, css.y);
    const expectedC = [...probe.expect] as [number, number, number];
    observations[probe.name] = { canvas: probe.canvas, css: [css.x, css.y], actual, expected: expectedC };
    expect(close(actual, expectedC, probe.tol), `${probe.name} @ (${css.x},${css.y}) rgb(${actual})`).toBe(true);
  }

  // DOM order of overlay layers must match zIndex order.
  const domIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#stage-root svg.overlay > g")).map((g) =>
      g.getAttribute("data-overlay-id"),
    ),
  );
  observations.domOrderIds = domIds;

  await shot(page, "exp3/exp3-layers");
  record("exp3", observations);
});