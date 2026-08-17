"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ApiRequestOptions } from "@/lib/api/client";

import {
  createAuthenticatedRequest,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
  type AdminSummary,
  type AuthResponse,
  type LoginRequest,
} from "./auth-client";

export type AuthStatus = "loading" | "visitor" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  admin?: AdminSummary;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string>();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [admin, setAdmin] = useState<AdminSummary>();

  const clearSession = useCallback(() => {
    setAccessToken(undefined);
    setAdmin(undefined);
    setStatus("visitor");
  }, []);

  const applySession = useCallback((session: AuthResponse) => {
    setAccessToken(session.accessToken);
    setAdmin(session.admin);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    let active = true;

    refreshAdminSession()
      .then((session) => {
        if (active) applySession(session);
      })
      .catch(() => {
        if (active) clearSession();
      });

    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      applySession(await loginAdmin(credentials));
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // Local credentials are cleared even if the remote session is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const request = useMemo(
    () =>
      createAuthenticatedRequest({
        getAccessToken: () => accessToken,
        onSession: applySession,
        onSessionLost: clearSession,
      }),
    [accessToken, applySession, clearSession],
  );

  const value = useMemo(
    () => ({ status, admin, login, logout, request }),
    [admin, login, logout, request, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");

  return context;
}
