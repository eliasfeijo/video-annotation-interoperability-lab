import { defineConfig } from "@playwright/test";

/**
 * Dedicated E17 (N1 cross-engine) runner.
 *
 * Deliberately SEPARATE from playwright.config.ts:
 *  - the main config has no `projects` array, so adding engines there would
 *    re-run every existing spec under each project;
 *  - testMatch pins this config to the E17 spec only, so `pnpm exec
 *    playwright test --config=playwright.e17.config.ts` never touches the
 *    historical suite and vice versa.
 */

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /e17\.spec\.ts$/,
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  outputDir: "./test-results/e17",
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
