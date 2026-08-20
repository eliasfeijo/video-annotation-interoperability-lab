import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, shot, record } from "./utils.ts";

/**
 * Experiment 2 — SVG primitives. Render the full-canvas primitives fixture and
 * record which elements actually paint. Screenshot is the primary evidence.
 */
test("exp2: all expected primitives render in DOM", async ({ page }) => {
  await gotoLab(page, { exp: "2" });
  await seek(page, 5);
  const snap = await snapshot(page);
  const entry = snap[0]!;
  expect(entry.visible).toBe(true);

  const shapeTags = entry.shapes.map((s) => s.tag);
  const expected = ["path", "line", "polyline", "polygon", "rect", "circle", "ellipse", "text"];
  for (const tag of expected) {
    expect(shapeTags, `should render a <${tag}>`).toContain(tag);
  }
  expect(entry.shapes.filter((s) => s.tag === "tspan").length).toBeGreaterThan(0);

  // marker must be present in defs
  const markerCount = await page.evaluate(() =>
    document.querySelectorAll("#stage-root svg.overlay marker").length,
  );
  expect(markerCount).toBeGreaterThanOrEqual(1);

  // text bbox must be non-empty (paints)
  const textShapes = entry.shapes.filter((s) => s.tag === "text");
  expect(textShapes.every((s) => s.rect.width > 0 && s.rect.height > 0)).toBe(true);

  const p = await shot(page, "exp2/exp2-primitives");
  record("exp2", {
    shapeCount: entry.shapes.length,
    tags: [...new Set(shapeTags)],
    textShapes,
    screenshot: p,
  });
});