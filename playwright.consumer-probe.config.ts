import { defineConfig } from "@playwright/test";

/**
 * Dedicated consumer-probe runner (historical N2) — mirrors the cross-engine
 * isolation pattern.
 *
 * Consumer probes are engine-independent targets for this stage (browser
 * behavior was established cross-engine); a single chromium project
 * keeps consumer variables isolated. testMatch pins this config to the
 * consumer-probe spec only, so neither suite can re-run the other.
 */

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /consumer-(probe|interaction)\.spec\.ts$/,
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  outputDir: "./test-results/consumer-probe",
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
