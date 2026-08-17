"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, apiRequest, type ApiRequestOptions } from "./client";

export type ApiRequester = <T>(path: string, options?: ApiRequestOptions) => Promise<T>;

interface QueryState<T> {
  requestKey: string | null;
  data: T | null;
  error: ApiError | Error | null;
}

export function useApiQuery<T>(requestPath: string | null, requester: ApiRequester = apiRequest) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<QueryState<T>>({
    requestKey: null,
    data: null,
    error: null,
  });
  const refetch = useCallback(() => setRevision((current) => current + 1), []);
  const updateData = useCallback((updater: (current: T) => T) => {
    setState((current) =>
      current.data === null ? current : { ...current, data: updater(current.data) },
    );
  }, []);
  const requestKey = requestPath ? `${requestPath}#${revision}` : null;

  useEffect(() => {
    if (!requestPath || !requestKey) return;

    const controller = new AbortController();
    requester<T>(requestPath, { signal: controller.signal })
      .then((data) => setState({ requestKey, data, error: null }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        const error = reason instanceof Error ? reason : new Error("Falha inesperada na consulta.");
        setState({ requestKey, data: null, error });
      });

    return () => controller.abort();
  }, [requestKey, requestPath, requester]);

  if (!requestKey) return { data: null, error: null, isLoading: false, refetch, updateData };

  const current = state.requestKey === requestKey;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    isLoading: !current,
    refetch,
    updateData,
  };
}
