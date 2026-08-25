import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * D1 — Interaction-level temporal experiment (I.3 execution).
 *
 * Drives the REAL Ramp consumer through its own playback surface (Video.js
 * controls) and observes temporal honoring. Mirador feasibility is recorded
 * separately as INCONCLUSIVE/unreachable if no consumer-owned path exists.
 *
 * Forbidden: direct video.play(), video.currentTime assignment, synthetic events,
 * src mutation, internal dispatch. Valid stimulus is a Playwright click on
 * the consumer's visible playback control.
 *
 * Evidence: evidence/viewer-interaction/* + evidence/viewer-interaction/viewer-interaction-matrix.json
 */

const ROWS_DIR = resolve("evidence", "viewer-interaction");
const MATRIX_PATH = resolve("evidence", "viewer-interaction", "viewer-interaction-matrix.json");
const SHOTS_DIR = resolve("evidence", "screenshots", "viewer-interaction");

test.describe.configure({ mode: "serial" });

type Page_ = import("@playwright/test").Page;

interface DomEl {
  tag: string;
  cls: string;
  src: string;
  rect: { x: number; y: number; w: number; h: number };
}

interface InteractionObservation {
  engine: string;
  browserVersion: string;
  userAgent: string;
  consumer: string;
  consumerVersion: string | null;
  versionSource: string[];
  manifest: string;
  slug: string;
  probeId: string;
  timestamp: string;
  interaction: {
    selectorAttempted: string[];
    selectorClicked: string | null;
    clickSucceeded: boolean;
    clickError: string | null;
  };
  videoBefore: { currentTime: number | null; paused: boolean | null; readyState: number | null; duration: number | null; currentSrc: string | null } | null;
  videoImmediatePostClick: { currentTime: number | null; paused: boolean | null; readyState: number | null } | null;
  videoSettled: { currentTime: number | null; paused: boolean | null; readyState: number | null } | null;
  timeDisplay: { currentTimeText: string | null; durationText: string | null; rawInnerText: string } | null;
  domInventory: DomEl[];
  domInventorySettled: DomEl[];
  bundleResourceUrls: string[];
  resolvedBundleUrls: Array<{ requested: string; final: string | null }>;
  logSample: string;
  rootTextSample: string;
  currentSrc: string | null;
  // causal diagnostics
  rampDiagnostics?: Record<string, unknown>;
  miradorDiagnostics?: Record<string, unknown>;
  classification: string;
  classificationReason: string;
}

const rows: InteractionObservation[] = [];

async function waitForRampVideoReady(page: Page_): Promise<void> {
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 45000 });
  await page
    .waitForFunction(
      () => {
        const v = document.querySelector("#root video") as HTMLVideoElement | null;
        if (!v) return false;
        // readyState HAVE_CURRENT_DATA =2
        return v.readyState >= 2;
      },
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(2500);
}

async function collectVideoState(page: Page_) {
  return page.evaluate(() => {
    const v = document.querySelector("#root video") as HTMLVideoElement | null;
    if (!v) return null;
    return {
      currentTime: v.currentTime,
      paused: v.paused,
      readyState: v.readyState,
      duration: v.duration,
      currentSrc: (v as HTMLVideoElement).currentSrc || v.getAttribute("src") || null,
    };
  });
}

async function collectTimeDisplay(page: Page_) {
  return page.evaluate(() => {
    const rootText = (document.querySelector("#root") as HTMLElement | null)?.innerText ?? "";
    // Try to locate Video.js time displays
    const curEl = document.querySelector(".vjs-current-time-display");
    const durEl = document.querySelector(".vjs-duration-display");
    return {
      currentTimeText: (curEl?.textContent ?? null as unknown) as string | null,
      durationText: (durEl?.textContent ?? null as unknown) as string | null,
      rawInnerText: rootText.slice(0, 500),
    };
  });
}

async function collectDomInventory(page: Page_): Promise<DomEl[]> {
  return page.evaluate(() => {
    const rectOf = (el: Element) => {
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    };
    const els = Array.from(document.querySelectorAll("#root video,#root img,#root svg,#root canvas,#root object"));
    return els.map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") ?? "").slice(0, 80),
      src: ((el as HTMLImageElement).currentSrc || el.getAttribute("src") || el.getAttribute("data") || "").slice(0, 160),
      rect: rectOf(el),
    }));
  });
}

async function collectBundleInfo(page: Page_) {
  const bundleResourceUrls: string[] = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => (r as PerformanceResourceTiming).name)
      .filter((n) => /ramp|mirador/.test(n))
      .slice(0, 5),
  );
  const jsUrls = bundleResourceUrls.filter((u) => u.endsWith(".js"));
  const resolved = await page.evaluate(async (urls: string[]) => {
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
  return { bundleResourceUrls, resolved };
}

async function attemptRampPlayClick(page: Page_): Promise<{ selectorClicked: string | null; clickSucceeded: boolean; clickError: string | null; attempted: string[] }> {
  const candidates = [".vjs-big-play-button", ".vjs-play-control", 'button.vjs-play-control', ".vjs-control-bar .vjs-play-control"];
  const attempted: string[] = [];
  for (const sel of candidates) {
    attempted.push(sel);
    const loc = page.locator(sel).first();
    const count = await loc.count();
    if (count === 0) continue;
    // Check visibility; big-play-button may be hidden after load but still valid
    const visible = await loc.isVisible().catch(() => false);
    const enabled = await loc.isEnabled().catch(() => false);
    // Try clicking even if not visible? For big-play-button, visible check is ok.
    try {
      await loc.click({ timeout: 5000 });
      return { selectorClicked: sel, clickSucceeded: true, clickError: null, attempted };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message.slice(0, 500) : String(e).slice(0, 500);
      // try next candidate
      if (sel === candidates[candidates.length - 1]) {
        return { selectorClicked: sel, clickSucceeded: false, clickError: msg, attempted };
      }
      continue;
    }
  }
  // Fallback: try clicking the video element's center via consumer surface? But we must not click video directly as it's ambiguous.
  // Instead report failure.
  return { selectorClicked: null, clickSucceeded: false, clickError: "no consumer control found", attempted };
}

async function runRampInteraction(
  page: Page_,
  browser: import("@playwright/test").Browser,
  manifest: string,
  slug: string,
): Promise<InteractionObservation> {
  mkdirSync(ROWS_DIR, { recursive: true });
  mkdirSync(SHOTS_DIR, { recursive: true });

  const host = "/viewer-check.html";
  await page.goto(`${host}?manifest=${encodeURIComponent(manifest)}`);
  await waitForRampVideoReady(page);

  const bundleInfo = await collectBundleInfo(page);
  const versionMatch = bundleInfo.resolved
    .map((r) => (r.final ?? r.requested).match(/@samvera\/ramp@([^/]+)/))
    .find(Boolean);
  const consumerVersion = versionMatch ? (versionMatch[1] ?? null) : null;

  const videoBefore = await collectVideoState(page);
  const domInventory = await collectDomInventory(page);
  const rootTextSample = await page.evaluate(() => ((document.querySelector("#root") as HTMLElement)?.innerText ?? "").slice(0, 600));
  const logSample = await page.evaluate(() => (document.querySelector("#log")?.textContent ?? "").slice(0, 800));

  // Valid stimulus: click consumer's own playback control
  const clickResult = await attemptRampPlayClick(page);

  // Post-click observation: immediate + settled
  await page.waitForTimeout(600);
  const videoImmediate = await collectVideoState(page);

  // Wait for playback liveness: timeupdate or currentTime advancing or paused false
  // Poll for up to 5s for evidence of playback starting
  await page
    .waitForFunction(
      () => {
        const v = document.querySelector("#root video") as HTMLVideoElement | null;
        if (!v) return false;
        // liveness: not paused OR currentTime has advanced beyond initial 0/10
        return !v.paused || v.currentTime > 0.5;
      },
      null,
      { timeout: 8000 },
    )
    .catch(() => {});

  await page.waitForTimeout(2000);
  const videoSettled = await collectVideoState(page);
  const timeDisplay = await collectTimeDisplay(page);
  const domInventorySettled = await collectDomInventory(page);

  // Collect additional diagnostics: check if currentSrc contains #t= (should not)
  const currentSrc = videoSettled?.currentSrc ?? videoBefore?.currentSrc ?? null;
  const hasMediaFragmentInSrc = currentSrc ? currentSrc.includes("#t=") : false;

  // Classification logic per taxonomy (conservative)
  let classification = "INCONCLUSIVE";
  let reason = "";

  if (!clickResult.clickSucceeded || !clickResult.selectorClicked) {
    classification = "INCONCLUSIVE";
    reason = `no valid consumer control click succeeded (attempted: ${clickResult.attempted.join(", ")}; error: ${clickResult.clickError ?? "none"}) — cannot distinguish`;
  } else if (!videoSettled) {
    classification = "INCONCLUSIVE";
    reason = "no video element after click";
  } else if (videoSettled.paused === true && (videoSettled.currentTime ?? 0) === 0) {
    classification = "INCONCLUSIVE";
    reason = "playback did not start after valid click (paused:true currentTime 0) — cannot distinguish not-started from ignored; autoplay or readyState gating";
  } else if (videoSettled.readyState !== null && videoSettled.readyState < 2) {
    classification = "INCONCLUSIVE";
    reason = `readyState ${videoSettled.readyState} insufficient for observation`;
  } else {
    // We have valid playback drive; now assess honoring vs not
    // This classification here is provisional; final HONORED/NOT-HONORED is determined by comparing temporal vs control runs together
    // We store raw values and mark as PROVISIONAL_DETERMINATION_PENDING
    classification = "PROVISIONAL_VALID_DRIVE";
    reason = `valid drive via ${clickResult.selectorClicked}; settled currentTime=${videoSettled.currentTime} paused=${videoSettled.paused} hasFragmentInSrc=${hasMediaFragmentInSrc}`;
  }

  const row: InteractionObservation = {
    engine: test.info().project.name,
    browserVersion: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    consumer: "Ramp",
    consumerVersion,
    versionSource: bundleInfo.resolved.map((r) => `${r.requested} -> ${r.final ?? "unresolved"}`),
    manifest,
    slug,
    probeId: `D1-${slug}`,
    timestamp: new Date().toISOString(),
    interaction: {
      selectorAttempted: clickResult.attempted,
      selectorClicked: clickResult.selectorClicked,
      clickSucceeded: clickResult.clickSucceeded,
      clickError: clickResult.clickError,
    },
    videoBefore,
    videoImmediatePostClick: videoImmediate,
    videoSettled,
    timeDisplay,
    domInventory,
    domInventorySettled,
    bundleResourceUrls: bundleInfo.bundleResourceUrls,
    resolvedBundleUrls: bundleInfo.resolved,
    logSample,
    rootTextSample,
    currentSrc,
    rampDiagnostics: {
      hasMediaFragmentInSrc,
      clickSelector: clickResult.selectorClicked,
      videoBeforeCurrentTime: videoBefore?.currentTime ?? null,
      videoSettledCurrentTime: videoSettled?.currentTime ?? null,
    },
    classification,
    classificationReason: reason,
  };

  // Persist per-run JSON immediately for inspection even if test fails later
  writeFileSync(resolve(ROWS_DIR, `probe-${slug}.json`), JSON.stringify(row, null, 2), "utf8");
  await page.screenshot({ path: resolve(SHOTS_DIR, `${slug}.png`) });
  rows.push(row);
  return row;
}

// ---------------------------------------------------------------------------
// Ramp D1 tests
// ---------------------------------------------------------------------------

// First run of temporal + control; second run replication is implicit via retry logic
test("d1 ramp: temporal #t=10,20 interaction (run 1)", async ({ page, browser }) => {
  const row = await runRampInteraction(page, browser, "/manifests/n2/n2-temporal.json", "ramp-d1-temporal-run1");
  // Must have driven playback validly; if INCONCLUSIVE due to no drive, fail the test to trigger retry
  expect(row.interaction.clickSucceeded, `click must succeed via consumer control (attempted ${row.interaction.selectorAttempted.join(", ")})`).toBe(true);
  expect(row.videoSettled, "video must exist after click").not.toBeNull();
  // Do not assert HONORED here; classification is finalized after comparing both fixtures
  // However ensure liveness for valid test
  // If still paused and at 0, we consider it an invalid run that needs retry, but mark as INCONCLUSIVE rather than hard fail
  if (row.classification === "INCONCLUSIVE") {
    // Let test pass but row records INCONCLUSIVE; the overall matrix will reflect it
    // Do not throw; the afterAll matrix aggregation will carry the signal
  }
});

test("d1 ramp: control (no fragment) interaction (run 1)", async ({ page, browser }) => {
  const row = await runRampInteraction(page, browser, "/manifests/viewer-plain.json", "ramp-d1-control-run1");
  expect(row.interaction.clickSucceeded).toBe(true);
  expect(row.videoSettled).not.toBeNull();
});

test("d1 ramp: temporal #t=10,20 interaction (run 2 replication)", async ({ page, browser }) => {
  const row = await runRampInteraction(page, browser, "/manifests/n2/n2-temporal.json", "ramp-d1-temporal-run2");
  expect(row.interaction.clickSucceeded).toBe(true);
  expect(row.videoSettled).not.toBeNull();
});

test("d1 ramp: control (no fragment) interaction (run 2 replication)", async ({ page, browser }) => {
  const row = await runRampInteraction(page, browser, "/manifests/viewer-plain.json", "ramp-d1-control-run2");
  expect(row.interaction.clickSucceeded).toBe(true);
  expect(row.videoSettled).not.toBeNull();
});

// ---------------------------------------------------------------------------
// Mirador feasibility check
// ---------------------------------------------------------------------------

test("d1 mirador: feasibility check — temporal manifest", async ({ page, browser }) => {
  mkdirSync(ROWS_DIR, { recursive: true });
  mkdirSync(SHOTS_DIR, { recursive: true });

  const manifest = "/manifests/n2/n2-temporal.json";
  const slug = "mirador-d1-temporal-feasibility";
  await page.goto(`/mirador-check.html?manifest=${encodeURIComponent(manifest)}`);
  await expect(page.locator("#status")).toContainText("bundle loaded", { timeout: 45000 });
  await page
    .waitForFunction(
      () => !!document.querySelector(".mirador-viewer") || !!document.querySelector("#root video"),
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForTimeout(2500);

  const bundleInfo = await collectBundleInfo(page);
  const versionMatch = bundleInfo.resolved
    .map((r) => (r.final ?? r.requested).match(/\/mirador@([^/]+)\//))
    .find(Boolean);
  const consumerVersion = versionMatch ? (versionMatch[1] ?? null) : null;

  const hasMiradorRoot = await page.evaluate(() => !!document.querySelector(".mirador-viewer"));
  const videoCount = await page.evaluate(() => document.querySelectorAll("#root video").length);
  const domInventory = await collectDomInventory(page);
  const rootText = await page.evaluate(() => ((document.querySelector("#root") as HTMLElement)?.innerText ?? "").slice(0, 600));

  // Search for any consumer-owned playback control for video
  const controlCandidates = await page.evaluate(() => {
    // All buttons inside #root
    const btns = Array.from(document.querySelectorAll("#root button, #root [role='button'], #root .MuiButtonBase-root"));
    return btns.map((b) => ({
      tag: b.tagName.toLowerCase(),
      cls: (b.getAttribute("class") ?? "").slice(0, 80),
      text: (b.textContent ?? "").slice(0, 80),
      ariaLabel: (b.getAttribute("aria-label") ?? "").slice(0, 80),
    })).slice(0, 30);
  });

  const hasVideo = videoCount > 0;
  const hasConsumerPlaybackControl = (() => {
    // Heuristic: look for buttons whose text/aria suggests Play/Pause/Seek and are inside Mirador viewer
    // Use word boundaries to avoid false positives like "display" containing "play"
    const blob = JSON.stringify(controlCandidates).toLowerCase();
    return /\bplay\b|\bpause\b|\bseek\b|\btimeline\b|\bscrub\b/.test(blob);
  })();

  // Attempt to locate a plausible control; if none, we report unreachable
  let clickedSelector: string | null = null;
  let clickSucceeded = false;
  let clickError: string | null = null;
  let classification = "INCONCLUSIVE";
  let reason = "";

  if (!hasMiradorRoot) {
    reason = "Mirador workspace did not mount";
  } else if (!hasVideo) {
    reason = "no video element rendered for temporal manifest";
  } else if (!hasConsumerPlaybackControl) {
    // Check if video has native controls attribute
    const hasNativeControls = await page.evaluate(() => {
      const v = document.querySelector("#root video") as HTMLVideoElement | null;
      return v ? v.hasAttribute("controls") : false;
    });
    reason = `no consumer-owned playback control found (native controls: ${hasNativeControls}); video relies on browser-native media controls — no valid causal path. Feasibility INCONCLUSIVE/unreachable.`;
  } else {
    reason = "found candidate control — would need further verification; currently treated as INCONCLUSIVE pending manual review";
  }

  const videoState = await collectVideoState(page);

  const row = {
    engine: test.info().project.name,
    browserVersion: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    consumer: "Mirador",
    consumerVersion,
    versionSource: bundleInfo.resolved.map((r) => `${r.requested} -> ${r.final ?? "unresolved"}`),
    manifest,
    slug,
    probeId: `D1-${slug}`,
    timestamp: new Date().toISOString(),
    interaction: {
      selectorAttempted: [] as string[],
      selectorClicked: clickedSelector,
      clickSucceeded,
      clickError,
    },
    hasMiradorRoot,
    videoCount,
    hasVideo,
    hasConsumerPlaybackControl,
    controlCandidates,
    domInventory,
    videoState,
    bundleResourceUrls: bundleInfo.bundleResourceUrls,
    resolvedBundleUrls: bundleInfo.resolved,
    classification,
    classificationReason: reason,
    rootTextSample: rootText,
  };

  writeFileSync(resolve(ROWS_DIR, `probe-${slug}.json`), JSON.stringify(row, null, 2), "utf8");
  await page.screenshot({ path: resolve(SHOTS_DIR, `${slug}.png`) });
  rows.push(row as unknown as InteractionObservation);

  expect(hasMiradorRoot, "Mirador workspace must mount").toBe(true);
  // We do NOT click native video controls; we deliberately stop at feasibility determination
});

test.afterAll(() => {
  // Finalize matrix with cross-fixture classification
  // Determine overall Ramp verdict by comparing temporal vs control settled times
  const rampTemporalRuns = rows.filter((r) => r.slug.includes("ramp-d1-temporal"));
  const rampControlRuns = rows.filter((r) => r.slug.includes("ramp-d1-control"));

  let overallRampClassification: string = "INCONCLUSIVE";
  let overallReason = "";

  if (rampTemporalRuns.length >= 2 && rampControlRuns.length >= 2) {
    const temporalValid = rampTemporalRuns.filter((r) => r.classification === "PROVISIONAL_VALID_DRIVE");
    const controlValid = rampControlRuns.filter((r) => r.classification === "PROVISIONAL_VALID_DRIVE");
    if (temporalValid.length < 2 || controlValid.length < 2) {
      overallRampClassification = "INCONCLUSIVE";
      overallReason = `not all runs achieved valid drive: temporal valid ${temporalValid.length}/2, control valid ${controlValid.length}/2`;
    } else {
      // Check settled times — after ~2.6s of playback, 0-trajectory settles ~2.5s, 10-trajectory would settle ~12.5s
      const tSettled = temporalValid.map((r) => r.videoSettled?.currentTime ?? null);
      const cSettled = controlValid.map((r) => r.videoSettled?.currentTime ?? null);
      const tAllNear10 = tSettled.every((t) => t !== null && t >= 9.0 && t <= 13.5);
      const cAllNear0Trajectory = cSettled.every((t) => t !== null && t >= 0 && t <= 4.0);
      const tAllNear0Trajectory = tSettled.every((t) => t !== null && t >= 0 && t <= 4.0);
      const delta = (() => {
        if (tSettled.some((t) => t === null) || cSettled.some((t) => t === null)) return null;
        const tAvg = (tSettled as number[]).reduce((a, b) => a + b, 0) / tSettled.length;
        const cAvg = (cSettled as number[]).reduce((a, b) => a + b, 0) / cSettled.length;
        return Math.abs(tAvg - cAvg);
      })();
      if (tAllNear10 && cAllNear0Trajectory && delta !== null && delta >= 7) {
        overallRampClassification = "HONORED";
        overallReason = `temporal settled ~10s (${tSettled.map((t) => t?.toFixed(2)).join(", ")}) vs control ~0s (${cSettled.map((t) => t?.toFixed(2)).join(", ")}) delta ${delta.toFixed(2)} with valid consumer drive`;
      } else if (tAllNear0Trajectory && cAllNear0Trajectory && delta !== null && delta < 1.0) {
        overallRampClassification = "NOT-HONORED";
        overallReason = `both temporal and control settled near 0-trajectory (temporal ${tSettled.map((t) => t?.toFixed(2)).join(", ")} control ${cSettled.map((t) => t?.toFixed(2)).join(", ")}) delta ${delta.toFixed(2)} — consumer drove playback but ignored fragment`;
      } else {
        overallRampClassification = "INCONCLUSIVE";
        overallReason = `temporal settled: ${tSettled.map((t) => t?.toFixed(2)).join(", ")} control settled: ${cSettled.map((t) => t?.toFixed(2)).join(", ")} delta ${delta?.toFixed(2) ?? "n/a"} — ambiguous trajectories`;
      }
    }
  } else {
    overallRampClassification = "INCONCLUSIVE";
    overallReason = `insufficient runs: temporal ${rampTemporalRuns.length}, control ${rampControlRuns.length}`;
  }

  // Update provisional rows to final if they were provisional
  // Keep evidence raw; matrix carries overall verdict

  const matrix = {
    experiment: "D1 interaction-level temporal probe",
    researchQuestion: "Does a real IIIF consumer honor #t=10,20 temporal fragments when actually driven through the consumer's own playback surface?",
    plan: "research/research-program.md Step 2 (authorized D1)",
    generatedAt: new Date().toISOString(),
    note: "Interaction probe: valid consumer-owned stimulus only. HONORED/NOT-HONORED require valid drive + causal distinction. Browser-only chain => INCONCLUSIVE.",
    overallRampClassification,
    overallRampReason: overallReason,
    // Mirador feasibility: derived from mirador row
    miradorFeasibility: (() => {
      const m = rows.find((r) => r.slug.includes("mirador"));
      if (!m) return { classification: "INCONCLUSIVE", reason: "no mirador run" };
      return { classification: m.classification, reason: m.classificationReason };
    })(),
    rowCount: rows.length,
    browserVersions: [...new Set(rows.map((r) => r.browserVersion))],
    probes: rows,
  };

  writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2), "utf8");
});
