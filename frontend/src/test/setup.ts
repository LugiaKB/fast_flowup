import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

// Default to mock mode so unit tests don't require a live API URL.
// Tests that need api mode must stub NEXT_PUBLIC_API_MODE and NEXT_PUBLIC_API_URL explicitly.
vi.stubEnv("NEXT_PUBLIC_API_MODE", "mock");

import { resetColaboradoresMockState } from "@/mocks/data/colaboradores";
import { resetWorkshopsMockState } from "@/mocks/data/workshops";
import { resetAuthMockState } from "@/mocks/handlers/auth";
import { server } from "@/mocks/server";

expect.extend(toHaveNoViolations);

if (!Element.prototype.hasPointerCapture) {
  Object.defineProperties(Element.prototype, {
    hasPointerCapture: { value: () => false },
    setPointerCapture: { value: () => undefined },
    releasePointerCapture: { value: () => undefined },
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetAuthMockState();
  resetColaboradoresMockState();
  resetWorkshopsMockState();
});

afterAll(() => server.close());
