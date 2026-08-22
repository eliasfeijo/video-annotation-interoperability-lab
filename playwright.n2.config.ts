import { defineConfig } from "@playwright/test";

/**
 * Dedicated N2 (real-consumer) runner — mirrors the E17 isolation pattern.
 *
 * Consumer probes are engine-independent targets for this stage (browser
 * behavior was established cross-engine in E17); a single chromium project
 * keeps consumer variables isolated. testMatch pins this config to the N2
 * spec only, so neither suite can re-run the other.
 */

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /n2-viewer\.spec\.ts$/,
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  outputDir: "./test-results/n2",
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1600, height: 1000 },
    screenshot: "off",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
