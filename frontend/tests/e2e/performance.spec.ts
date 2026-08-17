/**
 * Real API performance samples (T093).
 *
 * Collects response-time samples from the live backend and asserts that
 * the p95 latency is at or below 2 000 ms.
 *
 * Requirements:
 *   - Backend accessible at PLAYWRIGHT_API_URL (default: http://localhost:8080)
 *   - Run via:  npm run test:e2e:api
 *
 * The standard `npm run test:e2e` suite uses MSW mock mode and does NOT run
 * this file.
 */

import { expect, test } from "@playwright/test";

const API_URL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080";
const P95_THRESHOLD_MS = 2_000;
const SAMPLE_COUNT = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Measure the elapsed time (ms) of a single fetch. */
async function measureMs(url: string): Promise<number> {
  const start = performance.now();
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const elapsed = performance.now() - start;
  // Consume the body to avoid connection leaks.
  await res.text();
  return elapsed;
}

/** Compute the p-th percentile of a sorted array of numbers. */
function percentile(sortedSamples: number[], p: number): number {
  if (sortedSamples.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedSamples.length) - 1;
  return sortedSamples[Math.max(0, index)]!;
}

// ---------------------------------------------------------------------------
// Endpoint performance specs
// ---------------------------------------------------------------------------

test(`GET /api/colaboradores p95 <= ${P95_THRESHOLD_MS} ms`, async () => {
  const samples: number[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const ms = await measureMs(`${API_URL}/api/colaboradores?limit=20&offset=0`);
    samples.push(ms);
  }

  samples.sort((a, b) => a - b);
  const p95 = percentile(samples, 95);
  const min = samples[0]!.toFixed(0);
  const max = samples[samples.length - 1]!.toFixed(0);

  console.log(
    `[perf] GET /api/colaboradores — samples: ${SAMPLE_COUNT}, min: ${min} ms, max: ${max} ms, p95: ${p95.toFixed(0)} ms`,
  );

  expect(p95).toBeLessThanOrEqual(P95_THRESHOLD_MS);
});

test(`GET /api/workshops p95 <= ${P95_THRESHOLD_MS} ms`, async () => {
  const samples: number[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const ms = await measureMs(`${API_URL}/api/workshops?limit=20&offset=0`);
    samples.push(ms);
  }

  samples.sort((a, b) => a - b);
  const p95 = percentile(samples, 95);
  const min = samples[0]!.toFixed(0);
  const max = samples[samples.length - 1]!.toFixed(0);

  console.log(
    `[perf] GET /api/workshops — samples: ${SAMPLE_COUNT}, min: ${min} ms, max: ${max} ms, p95: ${p95.toFixed(0)} ms`,
  );

  expect(p95).toBeLessThanOrEqual(P95_THRESHOLD_MS);
});

test(`GET /api/colaboradores with search query p95 <= ${P95_THRESHOLD_MS} ms`, async () => {
  const samples: number[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const ms = await measureMs(`${API_URL}/api/colaboradores?query=a&limit=20`);
    samples.push(ms);
  }

  samples.sort((a, b) => a - b);
  const p95 = percentile(samples, 95);

  console.log(
    `[perf] GET /api/colaboradores?query=a — p95: ${p95.toFixed(0)} ms`,
  );

  expect(p95).toBeLessThanOrEqual(P95_THRESHOLD_MS);
});

test(`/health endpoint p95 <= 500 ms`, async () => {
  const samples: number[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const ms = await measureMs(`${API_URL}/health`);
    samples.push(ms);
  }

  samples.sort((a, b) => a - b);
  const p95 = percentile(samples, 95);

  console.log(`[perf] GET /health — p95: ${p95.toFixed(0)} ms`);

  // Health endpoint should be much faster than general queries.
  expect(p95).toBeLessThanOrEqual(500);
});
