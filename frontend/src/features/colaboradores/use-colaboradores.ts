"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type PagedColaboradores = components["schemas"]["PagedColaboradores"];

interface UseColaboradoresOptions {
  query: string;
  offset: number;
  limit: number;
}

interface ColaboradoresState {
  requestKey: string | null;
  data: PagedColaboradores | null;
  error: ApiError | Error | null;
}

export function useColaboradores({ query, offset, limit }: UseColaboradoresOptions) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<ColaboradoresState>({
    requestKey: null,
    data: null,
    error: null,
  });

  const refetch = useCallback(() => setRevision((current) => current + 1), []);
  const search = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery) search.set("query", normalizedQuery);
  const requestPath = `/api/colaboradores?${search}`;
  const requestKey = `${requestPath}#${revision}`;

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<PagedColaboradores>(requestPath, {
      signal: controller.signal,
    })
      .then((data) => setState({ requestKey, data, error: null }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        const error = reason instanceof Error ? reason : new Error("Falha inesperada na consulta.");
        setState({ requestKey, data: null, error });
      });

    return () => controller.abort();
  }, [requestKey, requestPath]);

  const current = state.requestKey === requestKey;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    isLoading: !current,
    refetch,
  };
}
