import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Exclude real-API specs — those require a live backend and run via
  // playwright.api.config.ts (npm run test:e2e:api).
  testIgnore: ["api-journeys.spec.ts", "performance.spec.ts"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    env: { NEXT_PUBLIC_API_MODE: "mock" },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
