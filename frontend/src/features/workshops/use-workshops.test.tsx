import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

import { server } from "@/mocks/server";

import { useWorkshop, useWorkshops } from "./use-workshops";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("workshop queries", () => {
  it("sends list search and pagination parameters", async () => {
    server.use(
      http.get("http://api.test/api/workshops", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("query")).toBe("Comunicação");
        expect(url.searchParams.get("offset")).toBe("10");
        expect(url.searchParams.get("limit")).toBe("10");

        return HttpResponse.json({ items: [], totalItems: 0, offset: 10, limit: 10 });
      }),
    );

    const { result } = renderHook(() =>
      useWorkshops({ query: "Comunicação", offset: 10, limit: 10 }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toMatchObject({ totalItems: 0, offset: 10, limit: 10 });
  });

  it("loads one workshop detail by identifier", async () => {
    server.use(
      http.get("http://api.test/api/workshops/7", () =>
        HttpResponse.json({
          id: 7,
          nome: "Comunicação que conecta",
          descricao: "Práticas objetivas para colaboração entre equipes.",
          dataRealizacao: "2026-07-16T16:00:00-03:00",
          dataTermino: "2026-07-16T17:00:00-03:00",
          status: "active",
          participantCount: 0,
          participantes: [],
          archiveEvents: [],
        }),
      ),
    );

    const { result } = renderHook(() => useWorkshop(7));

    await waitFor(() => expect(result.current.data?.id).toBe(7));
    expect(result.current.data?.nome).toBe("Comunicação que conecta");
  });
});
