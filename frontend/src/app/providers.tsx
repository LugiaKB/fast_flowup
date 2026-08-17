"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ApiRuntimeGate } from "@/lib/api/runtime-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiRuntimeGate>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ApiRuntimeGate>
  );
}
