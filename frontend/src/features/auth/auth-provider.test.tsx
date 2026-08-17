import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

import { server } from "@/mocks/server";

import { createAuthenticatedRequest } from "./auth-client";
import { AuthProvider, useAuth } from "./auth-provider";

const credentials = {
  email: "admin@example.test",
  password: "demo-only-password",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function SessionProbe() {
  const { admin, login, logout, status } = useAuth();

  return (
    <div>
      <p>{status}</p>
      {admin && <p>{admin.email}</p>}
      <button type="button" onClick={() => void login(credentials)}>
        Autenticar
      </button>
      <button type="button" onClick={() => void logout()}>
        Encerrar
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("restores a refresh session on load and logs out without browser token storage", async () => {
    const user = userEvent.setup();
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");

    const firstRender = render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("visitor")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Autenticar" }));
    expect(await screen.findByText(credentials.email)).toBeInTheDocument();
    expect(storageSpy).not.toHaveBeenCalled();

    firstRender.unmount();
    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText(credentials.email)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Encerrar" }));
    expect(await screen.findByText("visitor")).toBeInTheDocument();
    expect(screen.queryByText(credentials.email)).not.toBeInTheDocument();
  });

  it("falls back to a visitor when refresh is rejected", async () => {
    server.use(
      http.post("http://api.test/api/auth/refresh", () =>
        HttpResponse.json(
          {
            type: "about:blank",
            title: "Sessão ausente",
            status: 401,
            code: "unauthorized",
          },
          { status: 401 },
        ),
      ),
    );

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText("visitor")).toBeInTheDocument();
  });
});

describe("createAuthenticatedRequest", () => {
  it("refreshes once after a 401 and retries with the new bearer token", async () => {
    let protectedCalls = 0;
    let accessToken = "expired-token";
    const sessions: string[] = [];

    server.use(
      http.post("http://api.test/api/auth/refresh", () =>
        HttpResponse.json({
          accessToken: "renewed-token",
          accessTokenExpiresAt: "2026-08-17T18:15:00Z",
          admin: { id: "admin-1", email: credentials.email },
        }),
      ),
      http.get("http://api.test/api/protected", ({ request }) => {
        protectedCalls += 1;
        if (request.headers.get("Authorization") !== "Bearer renewed-token") {
          return HttpResponse.json(
            {
              type: "about:blank",
              title: "Token expirado",
              status: 401,
              code: "unauthorized",
            },
            { status: 401 },
          );
        }

        return HttpResponse.json({ ok: true });
      }),
    );

    const request = createAuthenticatedRequest({
      getAccessToken: () => accessToken,
      onSession: (session) => {
        accessToken = session.accessToken;
        sessions.push(session.accessToken);
      },
      onSessionLost: () => {
        accessToken = "";
      },
    });

    await expect(request<{ ok: boolean }>("/api/protected")).resolves.toEqual({ ok: true });
    expect(protectedCalls).toBe(2);
    expect(sessions).toEqual(["renewed-token"]);
  });

  it("does not enter a refresh loop when the retried request is unauthorized", async () => {
    let refreshCalls = 0;
    let sessionLostCalls = 0;

    server.use(
      http.post("http://api.test/api/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({
          accessToken: "still-invalid",
          accessTokenExpiresAt: "2026-08-17T18:15:00Z",
          admin: { id: "admin-1", email: credentials.email },
        });
      }),
      http.get("http://api.test/api/protected", () =>
        HttpResponse.json(
          {
            type: "about:blank",
            title: "Não autorizado",
            status: 401,
            code: "unauthorized",
          },
          { status: 401 },
        ),
      ),
    );

    const request = createAuthenticatedRequest({
      getAccessToken: () => "expired-token",
      onSession: vi.fn(),
      onSessionLost: () => {
        sessionLostCalls += 1;
      },
    });

    await expect(request("/api/protected")).rejects.toMatchObject({ status: 401 });
    expect(refreshCalls).toBe(1);
    expect(sessionLostCalls).toBe(1);
  });
});
