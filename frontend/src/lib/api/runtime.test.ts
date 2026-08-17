import { afterEach, vi } from "vitest";

import { getApiRuntimeConfig } from "./config";

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

  it("rejects API mode without an absolute API URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "api");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");

    expect(() => getApiRuntimeConfig()).toThrow("NEXT_PUBLIC_API_URL");
  });
});
