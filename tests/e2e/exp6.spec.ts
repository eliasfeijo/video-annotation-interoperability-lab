import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, rectCenterCanvas, shot, record } from "./utils.ts";

/**
 * Experiment 6 — aspect ratio. The overlay must track the *displayed* video
 * content (letterboxed), not the element box. Circle centre in Canvas units
 * must be invariant across viewport shapes.
 */
const ASPECTS = [
  { key: "16:9", param: "16:9", label: "16:9 viewport" },
  { key: "4:3", param: "4:3", label: "4:3 viewport" },
  { key: "narrow", param: "narrow", label: "narrow (480x1080)" },
  { key: "wide", param: "wide", label: "wide (1920x480)" },
] as const;

test("exp6: overlay tracks letterboxed video content across aspect presets", async ({ page }) => {
  const observations: Record<string, unknown> = {};

  for (const a of ASPECTS) {
    await gotoLab(page, { exp: "6", aspect: a.param });
    await seek(page, 12);

    const snap = await snapshot(page);
    const circle = snap[0]!.shapes.find((s) => s.tag === "circle")!;
    const center = await rectCenterCanvas(page, circle.rect);
    const region = snap[0]!.region;

    // Expected content rect (pure math, in-browser): stage fills the viewport,
    // video content is 'contain'ed within it.
    const expected = await page.evaluate(() => {
      const el = document.getElementById("stage-root")!;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const vw = 1920;
      const vh = 1080;
      const scale = Math.min(cw / vw, ch / vh);
      return { x: (cw - vw * scale) / 2, y: (ch - vh * scale) / 2, w: vw * scale, h: vh * scale };
    });

    observations[a.key] = {
      expectedContentRect: expected,
      overlayRegionRect: region,
      circleCenterCanvas: center,
      driftCanvas: { x: center.x - 960, y: center.y - 540 },
    };

    // Overlay region must match the expected (letterboxed) content rect closely.
    expect(Math.abs(region.x - expected.x)).toBeLessThan(2);
    expect(Math.abs(region.y - expected.y)).toBeLessThan(2);
    expect(Math.abs(region.width - expected.w)).toBeLessThan(2);
    expect(Math.abs(region.height - expected.h)).toBeLessThan(2);

    // Circle centre invariant in Canvas units.
    expect(Math.abs(center.x - 960)).toBeLessThan(1);
    expect(Math.abs(center.y - 540)).toBeLessThan(1);

    await shot(page, `exp6/epx6-${a.key.replace(":", "-")}`);
  }

  record("exp6", observations);
});