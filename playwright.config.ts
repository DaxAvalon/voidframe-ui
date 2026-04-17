import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test/visual",
  snapshotDir: "test/visual/__snapshots__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run demo -- --host 0.0.0.0 --port 5173",
    port: 5173,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: "dark-theme",
      use: { colorScheme: "dark" },
    },
    {
      name: "light-theme",
      use: { colorScheme: "light" },
    },
  ],
});
