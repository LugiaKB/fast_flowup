"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { ApiRuntimeGate } from "@/lib/api/runtime-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiRuntimeGate>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ApiRuntimeGate>
  );
}
