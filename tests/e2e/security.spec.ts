import { test, expect } from "@playwright/test";
import {
  gotoLab, seek, overlayDomCounts, snapshot, shot, record,
} from "./utils.ts";

/**
 * SVG security / allowlist experiment.
 *
 * sanitize=1 applies the allowlist (rejects script/foreignObject/a/image/use/
 * filter/style and on* attributes). sanitize=0 injects the raw body.
 * Evidence: DOM counts, what actually executes, screenshots.
 */
test("security: allowlist sanitizer strips dangerous elements", async ({ page }) => {
  await gotoLab(page, { exp: "security", sanitize: "1" });
  await seek(page, 5);
  const cleanCounts = await overlayDomCounts(page);
  for (const tag of ["script", "foreignObject", "a", "image", "use", "filter", "style"]) {
    expect(cleanCounts[tag], `sanitized DOM must not contain <${tag}>`).toBe(0);
  }
  // Sanitized harmless primitives remain.
  const snap = await snapshot(page);
  const totalShapes = snap.reduce((n, e) => n + e.shapes.length, 0);
  expect(totalShapes).toBeGreaterThan(0);
  await shot(page, "security/sanitized-on");

  // Raw body: dangerous nodes arrive in the DOM (innerHTML)...
  await gotoLab(page, { exp: "security", sanitize: "0" });
  await seek(page, 5);
  const rawCounts = await overlayDomCounts(page);
  for (const tag of ["script", "foreignObject", "a", "image", "filter", "style"]) {
    expect(rawCounts[tag], `raw DOM should contain <${tag}>`).toBeGreaterThan(0);
  }
  // ...but inline scripts injected via innerHTML do NOT execute.
  const title = await page.title();
  expect(title === "PWNED").toBe(false);
  await shot(page, "security/sanitized-off");

  record("security", {
    sanitized: cleanCounts,
    raw: rawCounts,
    scriptExecuted: false,
    title,
    note: "innerHTML-injected <script> does not execute; onclick attributes remain inert unless an event is dispatched",
  });
});