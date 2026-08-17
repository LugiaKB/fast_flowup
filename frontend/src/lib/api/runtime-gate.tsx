"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getApiRuntimeConfig } from "./runtime";

let workerStart: Promise<void> | undefined;

function startSimulatedBackend() {
  workerStart ??= import("@/mocks/browser").then(async ({ worker }) => {
    await worker.start({ onUnhandledRequest: "bypass" });
  });

  return workerStart;
}

export function ApiRuntimeGate({ children }: { children: ReactNode }) {
  const { mode } = getApiRuntimeConfig();
  const [ready, setReady] = useState(mode === "api");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (mode === "api") return;

    let active = true;
    startSimulatedBackend()
      .then(() => active && setReady(true))
      .catch(() => active && setFailed(true));

    return () => {
      active = false;
    };
  }, [mode]);

  if (failed) {
    return (
      <p role="alert" className="p-6 text-center text-error-strong">
        Não foi possível preparar os dados de demonstração.
      </p>
    );
  }

  if (!ready) {
    return (
      <p role="status" className="p-6 text-center text-body">
        Preparando dados de demonstração…
      </p>
    );
  }

  return children;
}
