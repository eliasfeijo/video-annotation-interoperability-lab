import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, pick, shot, record, expectParityClean } from "./utils.ts";

/**
 * Experiment 1 — temporal static overlay.
 * One Painting Annotation, red circle, active 10s..15s (half-open).
 */
test("exp1: circle visible only inside [10,15)", async ({ page }) => {
  const expected: Record<string, boolean> = { 9: false, 10: true, 12: true, 15: false, 16: false };
  const observations: Record<string, unknown> = {};
  const times: Record<number, unknown> = {};
  observations.times = times;

  const parity = await gotoLab(page, { exp: "1", t: 12 }).then(() => expectParityClean(page));
  expect(parity, "renderer A and B resolved sets should be identical").toBe(true);
  observations.parity = { clean: parity };

  for (const [s, expVisible] of Object.entries(expected)) {
    const t = parseFloat(s);
    await seek(page, t);
    const snap = await snapshot(page);
    const circle = pick(snap, "circle");
    times[t] = {
      expectedVisible: expVisible,
      activeIds: await page.evaluate((tt) => (window as any).__lab.activeIds(tt), t),
      overlayVisible: circle.visible,
      regionFrac: {
        w: circle.region.width,
        h: circle.region.height,
      },
      shapes: circle.shapes.map((s) => s.tag),
    };
    expect(circle.visible, `active at ${t}s`).toBe(expVisible);
    if (expVisible) expect(circle.shapes.some((s) => s.tag === "circle")).toBe(true);
    await shot(page, `exp1/t=${t}`);
  }

  const p = record("exp1", observations);
  console.log(`exp1 observations -> ${p}`);
});