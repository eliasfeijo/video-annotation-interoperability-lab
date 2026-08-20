import { test, expect } from "@playwright/test";
import { gotoLab, seek, snapshot, pick, shot, record } from "./utils.ts";

/**
 * Text experiment.
 * Renderer-A: `<text>`/`<tspan>` (font-dependent) vs path-outlined glyphs
 * (font-independent). Compare metrics and temporal behaviour.
 */
test("text: <text> vs outline paths, font metrics and temporal switching", async ({ page }) => {
  await gotoLab(page, { exp: "text" });
  await seek(page, 2);

  const snapT2 = await snapshot(page);
  const probe = pick(snapT2, "text-probe");
  const outlined = pick(snapT2, "outlined");
  expect(probe.visible).toBe(true);
  expect(outlined.visible).toBe(true);

  const textShapes = probe.shapes.filter((s) => s.tag === "text" || s.tag === "tspan");
  const pathShapes = outlined.shapes.filter((s) => s.tag === "path");

  // Font attributes actually applied in the engine.
  const fontInfo = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll("#stage-root svg.overlay text"));
    const first = texts[0] as SVGTextElement;
    const cs = getComputedStyle(first);
    return {
      family: cs.fontFamily,
      fontSize: cs.fontSize,
      paintOrder: cs.paintOrder,
    };
  });

  // Temporal text switching: outlined hides after 15s, probe stays.
  await seek(page, 16);
  const snapT16 = await snapshot(page);
  const outlinedLate = pick(snapT16, "outlined");
  expect(outlinedLate.visible).toBe(false);
  const probeLate = pick(snapT16, "text-probe");
  expect(probeLate.visible).toBe(true);

  await shot(page, "text/text-t2");
  await shot(page, "text/text-t16");

  record("text", {
    at2s: {
      probeShapes: textShapes.map((s) => ({ tag: s.tag, w: s.rect.width, h: s.rect.height })),
      outlinedPaths: pathShapes.length,
      outlinedPathRect: outlined.shapes[0]?.rect,
    },
    computedFont: fontInfo,
    at16s: { outlinedVisible: outlinedLate.visible, probeVisible: probeLate.visible },
  });
});