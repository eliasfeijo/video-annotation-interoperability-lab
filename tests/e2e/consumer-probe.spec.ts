import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Experiment N2 — real-consumer probe matrix (Ramp first, Mirador 3 smoke).
 *
 * Drives the REAL third-party bundles (unpkg UMD) against locally-served
 * controlled manifests and records whatever the consumer actually produces:
 * parse/render outcome, DOM inventory with bounding boxes, video state,
 * error text. This is an empirical consumer experiment — classifications
 * distinguish observed consumer behavior from browser behavior (E17) and
 * from normative claims.
 *
 * Evidence: evidence/viewer/probe-<slug>.json rows aggregated into
 * evidence/viewer-matrix.json; screenshots under evidence/screenshots/n2/.
 */

const ROWS = resolve("evidence", "viewer");
const MATRIX = resolve("evidence", "viewer-matrix.json");
const SHOTS = resolve("evidence", "screenshots", "n2");

test.describe.configure({ mode: "serial" });

type Page_ = import("@playwright/test").Page;

interface DomEl {
  tag: string;
  cls: string;
  src: string;
  rect: { x: number; y: number; w: number; h: number };
}

interface ProbeMeta {
  slug: string;
  consumer: string;
  manifest: string;
  targetDescription: string;
  embeddingPath: string;
  expectedInterpretations: string[];
  limitations?: string[];
}

interface ProbeRow extends ProbeMeta {
  probeId: string;
  engine: string;
  browserVersion: string;
  userAgent: string;
  consumerVersion: string | null;
  versionSource: string[];
  observed: Record<string, unknown>;
  outcome: string;
  classificationDraft: string;
  confidence: string;
}

const rows: ProbeRow[] = [];

async function capture(page: Page_, host: string, manifest: string): Promise<Record<string, unknown>> {
  await page.goto(`${host}?manifest=${encodeURIComponent(manifest)}`);
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 45000 });
  // Settle when either content or an error boundary appears; else fixed grace.
  await page
    .waitForFunction(
      () => {
        const t = (document.querySelector("#root") as HTMLElement | null)?.innerText ?? "";
        return !!document.querySelector("#root video") || !!document.querySelector(".mirador-viewer") || /error|cannot|invalid|failed/i.test(t);
      },
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(2500);

  const observed: Record<string, unknown> = await page.evaluate(() => {
    const rectOf = (el: Element) => {
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    };
    const els = Array.from(document.querySelectorAll("#root video,#root img,#root svg,#root canvas,#root object"));
    const domInventory: DomEl[] = els.map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 80),
      src: ((el as HTMLImageElement).currentSrc || el.getAttribute("src") || el.getAttribute("data") || "").slice(0, 160),
      rect: rectOf(el),
    }));
    const v = document.querySelector("#root video");
    return {
      videoCount: document.querySelectorAll("#root video").length,
      video: v
        ? {
            currentSrc: (v as HTMLVideoElement).currentSrc,
            readyState: (v as HTMLVideoElement).readyState,
            duration: (v as HTMLVideoElement).duration,
            currentTime: (v as HTMLVideoElement).currentTime,
            paused: (v as HTMLVideoElement).paused,
          }
        : null,
      miradorRoot: !!document.querySelector(".mirador-viewer"),
      rootTextSample: ((document.querySelector("#root") as HTMLElement)?.innerText ?? "").slice(0, 300),
      logSample: (document.querySelector("#log")?.textContent ?? "").slice(0, 600),
      domInventory,
      // Content-overlay candidates only: raster/canvas elements, or SVGs that
      // actually reference a resource. Ramp/Mirador UI chrome ships small
      // inline <svg> icons with empty src — excluded deliberately (lab note:
      // initial filter keyed on class names and was polluted by them).
      overlayCandidates: domInventory.filter(
        (e) => ["img", "canvas"].includes(e.tag) || (e.tag === "svg" && e.src !== ""),
      ),
      bundleResourceUrls: performance
        .getEntriesByType("resource")
        .map((r) => r.name)
        .filter((n) => /ramp|mirador/.test(n))
        .slice(0, 5),
    };
  });

  // Resolve unpkg semver ranges to exact versions (redirect targets).
  const jsUrls = ((observed.bundleResourceUrls as string[]) ?? []).filter((u) => u.endsWith(".js"));
  const resolved = await page.evaluate(async (urls) => {
    const out: Array<{ requested: string; final: string | null }> = [];
    for (const u of urls) {
      try {
        const r = await fetch(u, { method: "HEAD" });
        out.push({ requested: u, final: r.url || null });
      } catch {
        out.push({ requested: u, final: null });
      }
    }
    return out;
  }, jsUrls);
  observed.resolvedBundleUrls = resolved;
  return observed;
}

function classify(obs: Record<string, any>): { outcome: string; classificationDraft: string; confidence: string } {
  const errored = /error|cannot|invalid|failed/i.test(String(obs.rootTextSample ?? ""));
  if (obs.videoCount > 0 && (obs.overlayCandidates as DomEl[]).length === 0)
    return { outcome: "renders-video-only", classificationDraft: "[CONSUMER] renders video only; overlay body not rendered ([VIEWER_GAP] for that body type)", confidence: "high" };
  if (obs.videoCount > 0 && (obs.overlayCandidates as DomEl[]).length > 0)
    return { outcome: "renders-video-and-overlay", classificationDraft: "[CONSUMER] overlay element present in DOM — geometry measurable", confidence: "medium" };
  if (obs.videoCount === 0 && errored)
    return { outcome: "error-boundary-no-video", classificationDraft: "[VIEWER_GAP] consumer fails before rendering this manifest structure", confidence: "high" };
  if (!obs.miradorRoot && obs.videoCount === 0)
    return { outcome: "no-content-captured", classificationDraft: "[UNKNOWN] neither content nor a recognized error signal captured", confidence: "low" };
  if (obs.miradorRoot)
    return { outcome: "workspace-loaded", classificationDraft: "[CONSUMER] workspace loaded; AV/overlay support per inventory", confidence: "medium" };
  return { outcome: "unclear", classificationDraft: "[UNKNOWN]", confidence: "low" };
}

async function runProbe(page: Page_, browser: import("@playwright/test").Browser, meta: ProbeMeta): Promise<ProbeRow> {
  mkdirSync(ROWS, { recursive: true });
  mkdirSync(SHOTS, { recursive: true });
  const host = meta.consumer === "Mirador" ? "/mirador-check.html" : "/viewer-check.html";
  const observed = await capture(page, host, meta.manifest);
  const { outcome, classificationDraft, confidence } = classify(observed);
  const resolved = ((observed.resolvedBundleUrls as Array<{ requested: string; final: string | null }>) ?? []);
  const versionMatch = resolved
    .map((r) => (r.final ?? r.requested).match(/@samvera\/ramp@([^/]+)|\/mirador@([^/]+)\//))
    .find(Boolean);
  const row: ProbeRow = {
    probeId: `N2-${meta.slug}`,
    ...meta,
    engine: test.info().project.name,
    browserVersion: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    consumerVersion: versionMatch ? (versionMatch[1] ?? versionMatch[2] ?? null) : null,
    versionSource: resolved.map((r) => `${r.requested} -> ${r.final ?? "unresolved"}`),
    observed,
    outcome,
    classificationDraft,
    confidence,
  };
  writeFileSync(resolve(ROWS, `probe-${meta.slug}.json`), JSON.stringify(row, null, 2), "utf8");
  await page.screenshot({ path: resolve(SHOTS, `${meta.slug}.png`) });
  rows.push(row);
  return row;
}

// ---------------------------------------------------------------------------
// Ramp probes
// ---------------------------------------------------------------------------

test("n2 ramp V1: baseline plain video canvas", async ({ page, browser }) => {
  const row = await runProbe(page, browser, {
    slug: "ramp-v1-baseline",
    consumer: "Ramp",
    manifest: "/manifests/viewer-plain.json",
    targetDescription: "full Canvas, Video body",
    embeddingPath: "<video> via Ramp MediaPlayer",
    expectedInterpretations: ["video plays (consumer sanity baseline)", "consumer fails to load local manifest"],
    limitations: ["network-dependent (unpkg bundle)"],
  });
  expect(row.observed.videoCount as number, "baseline must render a video element").toBeGreaterThan(0);
  const v = row.observed.video as { readyState: number } | null;
  expect(v && v.readyState, "baseline video must reach HAVE_CURRENT_DATA").toBeGreaterThanOrEqual(2);
});

test("n2 ramp V2: temporal fragment on video body", async ({ page, browser }) => {
  const row = await runProbe(page, browser, {
    slug: "ramp-v2-temporal",
    consumer: "Ramp",
    manifest: "/manifests/n2/n2-temporal.json",
    targetDescription: "Canvas#t=10,20 MediaFragment URI on the Video body",
    embeddingPath: "<video> via Ramp MediaPlayer",
    expectedInterpretations: [
      "fragment honored: currentTime starts near 10",
      "parsed but ignored: playback from 0",
      "parse failure / error boundary",
    ],
    limitations: [
      "autoplay policies can pause the video; currentTime samples recorded raw",
      "'honored' is inferred from observable time state only, not from Ramp internals",
    ],
  });
  const v = row.observed.video as { currentTime: number } | null;
  const t0 = v ? v.currentTime : null;
  await page.waitForTimeout(3000);
  const t1 = await page.evaluate(() => (document.querySelector("#root video") as HTMLVideoElement | null)?.currentTime ?? null);
  row.observed.currentTimeSamples = { t0, t1After3s: t1 };
  writeFileSync(resolve(ROWS, "probe-ramp-v2-temporal.json"), JSON.stringify(row, null, 2), "utf8");
});

test("n2 ramp V3: spatial fragment on video body", async ({ page, browser }) => {
  await runProbe(page, browser, {
    slug: "ramp-v3-spatial",
    consumer: "Ramp",
    manifest: "/manifests/n2/n2-spatial.json",
    targetDescription: "Canvas#xywh=100,100,800,600 MediaFragment URI on the Video body",
    embeddingPath: "<video> via Ramp MediaPlayer",
    expectedInterpretations: [
      "parsed without failure (spatial fragment tolerated)",
      "parse failure / error boundary",
    ],
    limitations: ["a cropped video render is not expected from any IIIF AV client; probe tests parser robustness"],
  });
});

test("n2 ramp V4: explicit-viewBox SVG painting body @ region", async ({ page, browser }) => {
  await runProbe(page, browser, {
    slug: "ramp-v4-svg-vb-region",
    consumer: "Ramp",
    manifest: "/manifests/n2/n2-svg-vb.json",
    targetDescription: "video full canvas + SVG (viewBox 1000x1000 landmarks) @ xywh=480,270,960,540",
    embeddingPath: "painting Annotation Image body image/svg+xml",
    expectedInterpretations: [
      "renders SVG overlay geometry per I-REGION-VIEWPORT (region-as-viewport)",
      "renders some other reading (DOM-measurable divergence)",
      "error boundary / no render (viewer gap dominates geometry questions)",
    ],
    limitations: ["if the consumer throws, no geometric reading is observable at all"],
  });
});

test("n2 ramp V5: no-viewBox SVG painting body @ region", async ({ page, browser }) => {
  await runProbe(page, browser, {
    slug: "ramp-v5-svg-novb-region",
    consumer: "Ramp",
    manifest: "/manifests/n2/n2-svg-novb.json",
    targetDescription: "video full canvas + no-viewBox SVG (intrinsic 1000x1000) @ xywh=480,270,960,540",
    embeddingPath: "painting Annotation Image body image/svg+xml",
    expectedInterpretations: [
      "renders with intrinsic-stretch reading",
      "renders 1:1 user-space reading",
      "error boundary (identical to V4 would show the viewBox dimension is unobservable in this consumer)",
    ],
    limitations: ["same as V4"],
  });
});

test("n2 ramp V6: raster PNG painting body", async ({ page, browser }) => {
  await runProbe(page, browser, {
    slug: "ramp-v6-raster-body",
    consumer: "Ramp",
    manifest: "/manifests/n2/n2-raster.json",
    targetDescription: "video full canvas + PNG Image body full canvas",
    embeddingPath: "painting Annotation Image body image/png",
    expectedInterpretations: [
      "secondary raster Image body rendered alongside video",
      "error boundary (gap covers ANY secondary Image body, not just SVG)",
      "silently ignored",
    ],
    limitations: [],
  });
});

test("n2 ramp V7: stable-3 Canvas-as-body (E16 modeA twin)", async ({ page, browser }) => {
  await runProbe(page, browser, {
    slug: "ramp-v7-canvas-as-body",
    consumer: "Ramp",
    manifest: "/manifests/e16/e16-case03-sq-full-a.json",
    targetDescription: "stable IIIF 3.0 outer Canvas painting an inner Canvas as body (E16 case03 Mode A twin)",
    embeddingPath: "painting Annotation whose body is a Canvas resource",
    expectedInterpretations: [
      "nested composition rendered (pre-composed twin visible over video)",
      "error boundary (stable-3 nested Canvas unsupported by this consumer)",
      "silently ignored (inner canvas dropped)",
    ],
    limitations: ["modeA twin encodes the contain reading pre-composed; no live fit-rule decision is exercised"],
  });
});

// ---------------------------------------------------------------------------
// Mirador 3 smoke probe
// ---------------------------------------------------------------------------

test("n2 mirador M1: plain video canvas smoke", async ({ page, browser }) => {
  const row = await runProbe(page, browser, {
    slug: "mirador-m1-baseline",
    consumer: "Mirador",
    manifest: "/manifests/viewer-plain.json",
    targetDescription: "full Canvas, Video body",
    embeddingPath: "Mirador workspace window",
    expectedInterpretations: [
      "workspace loads; AV playback available",
      "workspace loads but AV canvas not playable (no <video>)",
      "bundle/load failure",
    ],
    limitations: ["smoke-level feasibility probe; NOT a full Mirador integration"],
  });
  expect(row.observed.miradorRoot as boolean, "Mirador workspace must mount").toBe(true);
});

test("n2 mirador M2: explicit-viewBox SVG painting body @ region", async ({ page, browser }) => {
  const row = await runProbe(page, browser, {
    slug: "mirador-m2-svg-vb-region",
    consumer: "Mirador",
    manifest: "/manifests/n2/n2-svg-vb.json",
    targetDescription: "video full canvas + SVG (viewBox landmarks) @ xywh=480,270,960,540",
    embeddingPath: "Mirador window canvas annotations",
    expectedInterpretations: [
      "renders SVG overlay geometry per I-REGION-VIEWPORT (region-as-viewport)",
      "renders some other reading (DOM-measurable divergence)",
      "SVG annotation dropped/ignored while video renders",
      "window fails on this canvas structure",
    ],
    limitations: ["smoke-level harness; no interaction with Mirador UI"],
  });
  // Decisive signal: does any content overlay element reference our fixture?
  const overlays = row.observed.overlayCandidates as DomEl[];
  row.observed.fixtureReferencingOverlays = overlays.filter((o) => /svg\/e15|\.svg/.test(o.src));
  expect(row.observed.miradorRoot as boolean, "Mirador workspace must mount").toBe(true);
});

test("n2 mirador M3: stable-3 Canvas-as-body", async ({ page, browser }) => {
  const row = await runProbe(page, browser, {
    slug: "mirador-m3-canvas-as-body",
    consumer: "Mirador",
    manifest: "/manifests/e16/e16-case03-sq-full-a.json",
    targetDescription: "stable IIIF 3.0 outer Canvas painting inner Canvas as body (E16 case03 Mode A twin)",
    embeddingPath: "Mirador window canvas annotations",
    expectedInterpretations: [
      "nested composition rendered over video",
      "inner Canvas body dropped/ignored while video renders",
      "window fails on this canvas structure",
    ],
    limitations: ["modeA twin encodes contain pre-composed; no live fit-rule decision exercised"],
  });
  expect(row.observed.miradorRoot as boolean, "Mirador workspace must mount").toBe(true);
});

test.afterAll(() => {
  writeFileSync(
    MATRIX,
    JSON.stringify(
      {
        experiment: "N2 real-consumer probe matrix",
        plan: "research/next-session-plan.md Stage 2",
        generatedAt: new Date().toISOString(),
        note: "Observed CONSUMER behavior only. Cross-engine BROWSER facts come from E17; [NORMATIVE] claims come from specifications cited in E15/E16 reports. Consumer behavior must not be promoted to normative rank.",
        probes: rows,
      },
      null,
      2,
    ),
    "utf8",
  );
});
