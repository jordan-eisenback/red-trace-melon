import { defineConfig, devices } from "@playwright/test";
import os from "os";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // CI: 2 workers (safe on a 2-core runner).
  // Local: half the available CPU cores (Playwright 1.x default for parallel mode).
  workers: process.env.CI ? 2 : Math.max(1, Math.floor(os.cpus().length / 2)),
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Start the dev server automatically before tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
