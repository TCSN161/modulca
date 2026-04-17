import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for ModulCA mobile smoke tests.
 *
 * Two projects — iPhone + Pixel. Playwright auto-fans tests across both.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "https://www.modulca.eu",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "iphone",
      use: { ...devices["iPhone 13 Pro"] },
    },
    {
      name: "android",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
