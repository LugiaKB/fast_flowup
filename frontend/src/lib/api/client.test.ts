import { afterEach, vi } from "vitest";

import { ApiError, apiRequest } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("returns a successful JSON payload with cookie credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ items: [1, 2] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest<{ items: number[] }>("/items", { baseUrl: "http://api.test" }),
    ).resolves.toEqual({ items: [1, 2] });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/items",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("serializes object bodies as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest<void>("/items", {
      baseUrl: "http://api.test",
      body: { name: "Ada" },
      method: "POST",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.body).toBe('{"name":"Ada"}');
    expect(new Headers(request.headers).get("content-type")).toBe("application/json");
  });

  it("maps Problem Details responses to ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            type: "https://workshops.fast/problems/conflict",
            title: "Conflito de domínio",
            status: 409,
            code: "workshop_quarter_conflict",
          },
          { status: 409 },
        ),
      ),
    );

    const error = await apiRequest("/failure", { baseUrl: "http://api.test" }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      problem: { code: "workshop_quarter_conflict" },
    });
  });

  it("normalizes malformed error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("gateway failure", { status: 502 })),
    );

    await expect(
      apiRequest("/failure", { baseUrl: "http://api.test" }),
    ).rejects.toMatchObject({
      status: 502,
      problem: { code: "unexpected_response" },
    });
  });

  it("passes AbortSignal cancellation through unchanged", async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted", "AbortError")),
          { once: true },
        );
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const request = apiRequest("/slow", {
      baseUrl: "http://api.test",
      signal: controller.signal,
    });

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
