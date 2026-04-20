import { defineConfig, devices } from "@playwright/test";

/**
 * Interaction-test suite for the dedicated e2e harness app (port 5176).
 * `test/visual/playwright.config.ts` at the project root continues to
 * drive visual-regression tests against the demo on :5173 — these two
 * configs are intentionally separate.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://localhost:5176",
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    // Start Vite from project root so it picks up the e2e root config via cwd.
    command: "npm run e2e:serve",
    url: "http://localhost:5176",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: "..",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Clipboard needed for CopyButton tests.
        permissions: ["clipboard-read", "clipboard-write"],
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
