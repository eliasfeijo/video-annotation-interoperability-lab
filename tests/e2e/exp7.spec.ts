import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, rectCenterCanvas, shot, record } from "./utils.ts";

/**
 * Experiment 7 — temporal movement.
 *
 * Renderer-A keyframes live OUTSIDE SVG (an experimental timeline the renderer
 * interpolates and applies as a translate). Compared against an SVG-internal
 * `<animate>` variant. Neither is proposed as a standard.
 */
test("exp7: external keyframe timeline moves the dot deterministically", async ({ page }) => {
  await gotoLab(page, { exp: "7", renderer: "a" });

  const expected = [
    { t: 10, x: 100 },
    { t: 12.5, x: 200 },
    { t: 15, x: 300 },
    { t: 17.5, x: 450 },
    { t: 20, x: 600 },
  ];

  const obs: Record<string, unknown> = {};
  for (const e of expected) {
    await seek(page, e.t);
    const snap = await snapshot(page);
    const circle = snap.find((s) => s.shapes.some((sh) => sh.tag === "circle"))!;
    const center = await rectCenterCanvas(page, circle.shapes.find((s) => s.tag === "circle")!.rect);
    obs[`keyframe@${e.t}`] = { expectedX: e.x, actualCenter: center };
    expect(circle.visible).toBe(true);
    expect(Math.abs(center.x - e.x)).toBeLessThan(8);
    await shot(page, `exp7/keyframes-t${e.t}`);
  }

  // Bi-weekly variants: at t=12.5 (2.5s into the 10s animate) the SVG-internal
  // version should ALSO be near x=200 — an apples-to-apples sanity check.
  await gotoLab(page, { exp: "7-animate" });
  await seek(page, 12.5);
  const asnap = await snapshot(page);
  const acircle = asnap.find((s) => s.shapes.some((sh) => sh.tag === "circle"))!;
  const acenter = await rectCenterCanvas(page, acircle.shapes.find((s) => s.tag === "circle")!.rect);
  obs["svganimate@12.5"] = { actualCenter: acenter };
  await shot(page, "exp7/svg-animate-t12.5");

  record("exp7", obs);
});