import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterAll, afterEach, beforeAll, expect } from "vitest";

import { resetColaboradoresMockState } from "@/mocks/data/colaboradores";
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
});

afterAll(() => server.close());
