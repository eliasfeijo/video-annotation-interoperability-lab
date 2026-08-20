import { test, expect } from "@playwright/test";
import {
  gotoLab,
  seek,
  snapshot,
  pick,
  shot,
  record,
  overlayDomCounts,
} from "./utils.ts";

/**
 * Blind Renderer E2E. Drives the lab with ?renderer=blind, verifies the
 * blind-resolved semantics in the browser (parityBlind), probes the DOM
 * (viewBox presence/absence, unsafe rejection marker, sanitization) and
 * captures screenshots for evidence/blind-screenshots.
 */

async function parity(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as any).__lab.parityBlind());
}

test("blind: clean cases resolve identically to reference", async ({ page }) => {
  const clean = ["case1", "case2", "case3", "case4", "case5", "case6", "case7", "case8", "case9", "case12"];
  const obs: Record<string, unknown> = {};
  for (const c of clean) {
    await gotoLab(page, { exp: c, renderer: "blind" });
    const p = await parity(page);
    obs[c] = p;
    expect(p.verdicts.every((v: string) => v === "match"), `${c}: ${JSON.stringify(p)}`).toBe(true);
  }
  record("blind-clean-parity", obs);
});

test("blind: case5 three viewBoxes into one region -> three distinct placements", async ({ page }) => {
  await gotoLab(page, { exp: "case5", renderer: "blind" });
  const snap = await snapshot(page);
  const ids = snap.map((e) => e.id);
  expect(ids.filter((id) => id.includes("vb1920") || id.includes("vb1000") || id.includes("vb100"))).toHaveLength(3);
  // Same destination region (Canvas units), three different letterboxed crops.
  const regions = new Set(snap.map((e) => `${e.region.width}x${e.region.height}`));
  expect(regions.size).toBe(1);
  const shapes = await page.evaluate(() =>
    (window as any).__lab.snapshot().map((e: any) => ({
      id: e.id,
      shapeRects: e.shapes.map((s: any) => `${Math.round(s.rect.width)}x${Math.round(s.rect.height)}`),
    })),
  );
  const uniqueCrops = new Set(shapes.map((s: any) => s.shapeRects.join(",")));
  expect(uniqueCrops.size).toBeGreaterThan(1);
  await shot(page, `blind/case5-three-viewboxes`);
});

test("blind: case11 no-viewBox body gets NO synthesized viewBox (1:1 placement)", async ({ page }) => {
  await gotoLab(page, { exp: "case11", renderer: "blind" });
  const nested = await page.evaluate(() => {
    const out: Record<string, string | null> = {};
    for (const el of document.querySelectorAll("[data-overlay-id]")) {
      const nested = el.querySelector("[data-overlay-nested]");
      if (nested) out[el.getAttribute("data-overlay-id")!] = nested.getAttribute("viewBox");
    }
    return out;
  });
  // viewbox-intrinsic carries a viewBox => written; no-viewbox carries none => absent.
  expect(nested["http://localhost:5173/annotation/viewbox-intrinsic"]).not.toBeNull();
  expect(nested["http://localhost:5173/annotation/no-viewbox"]).toBeNull();
  await shot(page, `blind/case11-noviewbox`);
});

test("blind: case10 out-of-bounds spatial fragment drops to full canvas", async ({ page }) => {
  await gotoLab(page, { exp: "case10", renderer: "blind" });
  const blind = await page.evaluate(() => (window as any).__lab.blindResolved());
  const oob = blind.overlays.find((o: any) => o.id.includes("out-of-bounds"));
  expect(oob.destination).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
});

test("blind: case13 rejects unsafe SVG with an explicit marker, sanitizes unsupported", async ({ page }) => {
  await gotoLab(page, { exp: "case13", renderer: "blind" });
  const counts = await overlayDomCounts(page);
  for (const tag of ["script", "foreignObject", "a", "image", "use", "style"]) {
    expect(counts[tag], `blind DOM must not contain <${tag}>`).toBe(0);
  }
  const sec = await page.evaluate(() => {
    const out: Record<string, string | null> = {};
    for (const el of document.querySelectorAll("[data-overlay-id]")) {
      const marker = el.querySelector("[data-sec]");
      out[el.getAttribute("data-overlay-id")!] = marker?.getAttribute("data-sec") ?? null;
    }
    return out;
  });
  const byId: Record<string, string> = {
    clean: "safe",
    unsupported: "unsupported",
    unsafe: "unsafe",
  };
  for (const [k, level] of Object.entries(byId)) {
    const entry = Object.entries(sec).find(([id]) => id.includes(k));
    const marker = entry?.[1] ?? null;
    if (level === "unsafe") {
      expect(marker, `${k} should carry data-sec=unsafe`).toBe("unsafe");
    } else {
      expect(marker, `${k} should not be rejected`).toBeNull();
    }
  }
  await shot(page, `blind/case13-security`);
});

test("blind: case6 temporal visibility holds under every display aspect", async ({ page }) => {
  const aspects = ["16:9", "4:3", "narrow", "wide"] as const;
  const obs: Record<string, unknown> = {};
  for (const aspect of aspects) {
    await gotoLab(page, { exp: "case6", renderer: "blind", aspect });
    await seek(page, 12);
    const snap = await snapshot(page);
    const circle = pick(snap, "case6");
    obs[aspect] = {
      visible: circle.visible,
      region: circle.region,
      shapes: circle.shapes.map((s) => s.tag),
    };
    expect(circle.visible).toBe(true);
    const shotName = `blind/case6-aspect-${aspect.replace(":", "")}`;
    await shot(page, shotName);
    await seek(page, 15);
    expect((await snapshot(page)).every((e) => !e.visible)).toBe(true);
  }
  record("blind-case6-aspects", obs);
});

test("blind: screenshots for representative cases", async ({ page }) => {
  for (const [c, t] of [
    ["case1", 12],
    ["case2", 5],
    ["case3", 5],
    ["case4", 5],
    ["case7", 5],
    ["case8", 5],
    ["case9", 5],
    ["case12", 5],
  ] as const) {
    await gotoLab(page, { exp: c, renderer: "blind", t });
    await seek(page, t);
    await shot(page, `blind/${c}`);
  }
});