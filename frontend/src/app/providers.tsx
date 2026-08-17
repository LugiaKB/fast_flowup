"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/auth-provider";

let workerStart: Promise<void> | undefined;

function startMockWorker() {
  workerStart ??= import("@/mocks/browser").then(async ({ worker }) => {
    await worker.start({ onUnhandledRequest: "bypass" });
  });

  return workerStart;
}

export function Providers({ children }: { children: ReactNode }) {
  const mockEnabled = process.env.NEXT_PUBLIC_API_MODE === "mock";
  const [ready, setReady] = useState(!mockEnabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!mockEnabled) return;

    let active = true;
    startMockWorker()
      .then(() => active && setReady(true))
      .catch(() => active && setFailed(true));

    return () => {
      active = false;
    };
  }, [mockEnabled]);

  if (failed) {
    return (
      <p role="alert" className="p-6 text-center text-error-strong">
        Não foi possível preparar os dados de demonstração.
      </p>
    );
  }

  if (!ready) {
    return (
      <p role="status" className="p-6 text-center text-gray-700">
        Preparando dados de demonstração…
      </p>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
