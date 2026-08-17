import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

import { server } from "@/mocks/server";

import { useColaboradores } from "./use-colaboradores";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useColaboradores", () => {
  it("sends search and pagination parameters and returns the contract page", async () => {
    server.use(
      http.get("http://api.test/api/colaboradores", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("query")).toBe("Ana");
        expect(url.searchParams.get("offset")).toBe("0");
        expect(url.searchParams.get("limit")).toBe("20");

        return HttpResponse.json({
          items: [
            {
              id: 1,
              nome: "Ana Beatriz",
              status: "active",
              createdAt: "2026-01-08T12:00:00Z",
              updatedAt: "2026-01-08T12:00:00Z",
            },
          ],
          totalItems: 1,
          offset: 0,
          limit: 20,
        });
      }),
    );

    const { result } = renderHook(() =>
      useColaboradores({ query: "Ana", offset: 0, limit: 20 }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toMatchObject({ totalItems: 1, offset: 0, limit: 20 });
    expect(result.current.data?.items.map(({ nome }) => nome)).toEqual(["Ana Beatriz"]);
  });

  it("maps contract failures to a retryable error state", async () => {
    server.use(
      http.get("http://api.test/api/colaboradores", () =>
        HttpResponse.json(
          {
            type: "https://workshops.fast/problems/unavailable",
            title: "Serviço indisponível",
            status: 503,
            code: "service_unavailable",
          },
          { status: 503 },
        ),
      ),
    );

    const { result } = renderHook(() =>
      useColaboradores({ query: "", offset: 0, limit: 20 }),
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toMatchObject({ status: 503 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.refetch).toEqual(expect.any(Function));
  });

  it("requests a new page when the offset changes", async () => {
    server.use(
      http.get("http://api.test/api/colaboradores", ({ request }) => {
        const offset = Number(new URL(request.url).searchParams.get("offset"));
        return HttpResponse.json({
          items: [
            {
              id: offset + 1,
              nome: offset === 0 ? "Ana Beatriz" : "Carlos Eduardo",
              status: "active",
              createdAt: "2026-01-08T12:00:00Z",
              updatedAt: "2026-01-08T12:00:00Z",
            },
          ],
          totalItems: 2,
          offset,
          limit: 1,
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ offset }) => useColaboradores({ query: "", offset, limit: 1 }),
      { initialProps: { offset: 0 } },
    );
    await waitFor(() => expect(result.current.data?.offset).toBe(0));

    rerender({ offset: 1 });

    await waitFor(() => expect(result.current.data?.offset).toBe(1));
    expect(result.current.data?.items[0]?.nome).toBe("Carlos Eduardo");
  });
});
