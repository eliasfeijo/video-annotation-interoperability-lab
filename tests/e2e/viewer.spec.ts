import { expect, test } from "@playwright/test";
import { record } from "./utils.ts";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Experiment 11 — third-party viewer. Ramp (@samvera/ramp, the reference IIIF
 * AV player from Avalon Media System) is loaded client-side from unpkg and
 * pointed at a locally-served manifest. Requires network access to unpkg.
 *
 * This is a genuinely third-party consumer of the manifest: our renderer is not
 * involved. We record (a) whether Ramp plays the plain time-based video Canvas,
 * and (b) what happens when the same Canvas additionally carries our SVG
 * painting annotation — the "viewer-vs-model" gap.
 */
test("viewer: Ramp plays a plain time-based video Canvas locally", async ({ page }) => {
  await page.goto(
    `/viewer-check.html?manifest=${encodeURIComponent("/manifests/viewer-plain.json")}`,
  );
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 30000 });
  await expect(page.locator("video")).toBeAttached({ timeout: 30000 });

  // Give the video element a moment to start loading the local mp4.
  await page.waitForFunction(
    () => {
      const v = document.querySelector("video");
      return !!v && v.readyState >= 2;
    },
    null,
    { timeout: 30000 },
  );

  const obs = await page.evaluate(() => {
    const v = document.querySelector("video")!;
    return {
      readyState: v.readyState,
      duration: v.duration,
      currentSrc: v.currentSrc,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
    };
  });
  await shotViewer(page, "viewer/ramp-plain-video");

  record("viewer-plain", {
    ...obs,
    note: "Ramp plays the local video Canvas: the standards structure (Canvas/AnnotationPage/painting Video body) is consumable by a mainstream IIIF AV viewer.",
  });

  expect(obs.readyState).toBeGreaterThanOrEqual(2);
  expect(obs.currentSrc).toContain("test-grid-1920x1080-30s.mp4");
});

test("viewer: Ramp fails on the same Canvas with the SVG painting annotation", async ({ page }) => {
  await page.goto(`/viewer-check.html?manifest=${encodeURIComponent("/manifests/exp1.json")}`);
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 30000 });

  // Ramp's error boundary surfaces a message; the exact text is version-dependent.
  const boundaryText = await page.locator("#root").innerText({ timeout: 30000 });
  const videoCount = await page.locator("video").count();

  await shotViewer(page, "viewer/ramp-with-svg-annotation");

  record("viewer-svg-annotation", {
    rootText: boundaryText.slice(0, 200),
    videoCount,
    note: "Adding an Image/SVG painting annotation to the same video Canvas makes Ramp throw (React error boundary) instead of playing — a real viewer-vs-model limitation for SVG-body video annotations.",
  });

  expect(videoCount).toBe(0);
});

/** The viewer page has no #viewport; screenshot the whole page. */
async function shotViewer(page: import("@playwright/test").Page, name: string): Promise<string> {
  mkdirSync(resolve("evidence", "screenshots"), { recursive: true });
  const p = resolve("evidence", "screenshots", `${name}.png`);
  await page.screenshot({ path: p });
  return p;
}

/**
 * E14 viewer probe — Model B (nested Overlay Canvas, IIIF 4.0 DRAFT context).
 * Ramp is a stable IIIF 3.0 viewer; the draft 4.0 nested-Canvas-as-Content-
 * Resource structure is expected to be unparseable. This records the
 * VIEWER_GAP: the expressive structure exists only in the draft, and no stable
 * mainstream viewer consumes it.
 */
test("e14 viewer: Ramp cannot consume a nested Overlay Canvas (IIIF 4.0 draft)", async ({ page }) => {
  await page.goto(
    `/viewer-check.html?manifest=${encodeURIComponent("/manifests/e14/e14-case14-b.json")}`,
  );
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 30000 });

  const boundaryText = await page.locator("#root").innerText({ timeout: 30000 });
  const videoCount = await page.locator("video").count();
  const logText = await page.locator("#log").innerText();

  await shotViewer(page, "viewer/e14-case14-b-ramp");

  record("viewer-e14-case14-b", {
    rootText: boundaryText.slice(0, 200),
    videoCount,
    log: logText.slice(0, 400),
    note: "Nested Canvas painting (Model B) uses the IIIF 4.0 draft context; stable Ramp cannot parse it. Model B is expressible only in the draft — a VIEWER_GAP and a draft-only dependency.",
  });
});