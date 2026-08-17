import { http, HttpResponse } from "msw";

import { DEMO_ADMIN_CREDENTIALS } from "@/features/auth/demo-credentials";
import type { components } from "@/lib/api/schema";

type AdminSummary = components["schemas"]["AdminSummary"];
type AuthResponse = components["schemas"]["AuthResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const mockAdmin: AdminSummary = {
  id: "admin-1",
  email: DEMO_ADMIN_CREDENTIALS.email,
};

let refreshSessionActive = false;
let accessTokenSequence = 0;
let currentAccessToken = "";

function unauthorizedProblem(): ProblemDetails {
  return {
    type: "https://workshops.fast/problems/unauthorized",
    title: "Não foi possível autenticar",
    status: 401,
    code: "unauthorized",
  };
}

function unauthorizedResponse() {
  return HttpResponse.json(unauthorizedProblem(), {
    status: 401,
    headers: { "Content-Type": "application/problem+json" },
  });
}

function issueSession(): AuthResponse {
  accessTokenSequence += 1;
  currentAccessToken = `mock-access-token-${accessTokenSequence}`;

  return {
    accessToken: currentAccessToken,
    accessTokenExpiresAt: "2099-01-01T00:15:00Z",
    admin: mockAdmin,
  };
}

export function resetAuthMockState() {
  refreshSessionActive = false;
  accessTokenSequence = 0;
  currentAccessToken = "";
}

export const authHandlers = [
  http.post("*/api/auth/login", async ({ request }) => {
    const credentials = (await request.json()) as Partial<LoginRequest>;
    const validCredentials =
      credentials.email === DEMO_ADMIN_CREDENTIALS.email &&
      credentials.password === DEMO_ADMIN_CREDENTIALS.password;

    if (!validCredentials) return unauthorizedResponse();

    // This server-side state represents the opaque HttpOnly cookie that browser
    // JavaScript cannot read. The real API owns the cookie and its rotation.
    refreshSessionActive = true;
    return HttpResponse.json(issueSession());
  }),

  http.post("*/api/auth/refresh", () => {
    if (!refreshSessionActive) return unauthorizedResponse();

    return HttpResponse.json(issueSession());
  }),

  http.post("*/api/auth/logout", () => {
    refreshSessionActive = false;
    currentAccessToken = "";
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/auth/me", ({ request }) => {
    if (request.headers.get("Authorization") !== `Bearer ${currentAccessToken}`) {
      return unauthorizedResponse();
    }

    return HttpResponse.json(mockAdmin);
  }),
];
