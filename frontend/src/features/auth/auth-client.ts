import { apiRequest, ApiError, type ApiRequestOptions } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type AdminSummary = components["schemas"]["AdminSummary"];
export type AuthResponse = components["schemas"]["AuthResponse"];
export type LoginRequest = components["schemas"]["LoginRequest"];

export function loginAdmin(credentials: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function refreshAdminSession() {
  return apiRequest<AuthResponse>("/api/auth/refresh", { method: "POST" });
}

export function logoutAdmin() {
  return apiRequest<void>("/api/auth/logout", { method: "POST" });
}

type AuthenticatedRequestDependencies = {
  getAccessToken: () => string | undefined;
  onSession: (session: AuthResponse) => void;
  onSessionLost: () => void;
};

function withBearer(options: ApiRequestOptions, accessToken: string | undefined) {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return { ...options, headers };
}

export function createAuthenticatedRequest({
  getAccessToken,
  onSession,
  onSessionLost,
}: AuthenticatedRequestDependencies) {
  return async function authenticatedRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    try {
      return await apiRequest<T>(path, withBearer(options, getAccessToken()));
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
    }

    let renewedSession: AuthResponse;
    try {
      renewedSession = await refreshAdminSession();
      onSession(renewedSession);
    } catch (error) {
      onSessionLost();
      throw error;
    }

    try {
      return await apiRequest<T>(path, withBearer(options, renewedSession.accessToken));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onSessionLost();
      throw error;
    }
  };
}
