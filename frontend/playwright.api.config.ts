/**
 * Playwright configuration for real-API integration tests (T085, T093).
 *
 * Runs api-journeys.spec.ts and performance.spec.ts against a live backend.
 *
 * Prerequisites:
 *   1. Copy .env.example to .env and fill in secrets.
 *   2. Start the full stack:  docker compose up --build -d
 *   3. Wait for backend health:  curl http://localhost:8080/health
 *   4. Run:  npm run test:e2e:api
 *
 * Environment variables (optional overrides):
 *   PLAYWRIGHT_API_URL    — backend base URL   (default: http://localhost:8080)
 *   PLAYWRIGHT_BASE_URL   — frontend base URL  (default: http://localhost:3000)
 *   E2E_ADMIN_USERNAME    — admin username      (default: admin)
 *   E2E_ADMIN_PASSWORD    — admin password      (default: Admin@123!)
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["api-journeys.spec.ts", "performance.spec.ts"],
  fullyParallel: false, // real API tests must be serial to avoid state conflicts
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-api" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // Cookies must be sent to the API domain for refresh to work.
    extraHTTPHeaders: {
      Origin: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    },
  },
  projects: [
    { name: "chromium-api", use: { ...devices["Desktop Chrome"] } },
  ],
  // No webServer block: the full stack must already be running via docker compose.
});
