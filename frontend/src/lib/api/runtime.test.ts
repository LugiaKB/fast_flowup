import { afterEach, vi } from "vitest";

import { getApiRuntimeConfig } from "./runtime";

afterEach(() => vi.unstubAllEnvs());

describe("API runtime configuration", () => {
  it("uses the real API by default", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    expect(getApiRuntimeConfig()).toEqual({
      baseUrl: "http://localhost:8080",
      mode: "api",
    });
  });

  it("enables the simulated backend only when explicitly configured", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "mock");

    expect(getApiRuntimeConfig().mode).toBe("mock");
  });
});
