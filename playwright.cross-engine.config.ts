import { defineConfig } from "@playwright/test";

/**
 * Dedicated cross-engine replication runner (historical E17/N1).
 *
 * Deliberately SEPARATE from playwright.config.ts:
 *  - the main config has no `projects` array, so adding engines there would
 *    re-run every existing spec under each project;
 *  - testMatch pins this config to the cross-engine spec only, so `pnpm exec
 *    playwright test --config=playwright.cross-engine.config.ts` never touches
 *    the historical suite and vice versa.
 */

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /cross-engine\.spec\.ts$/,
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  outputDir: "./test-results/cross-engine",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1600, height: 1000 },
    screenshot: "off",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
