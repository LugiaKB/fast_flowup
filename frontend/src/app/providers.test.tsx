import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { Providers } from "./providers";

const start = vi.fn().mockResolvedValue(undefined);

vi.mock("@/mocks/browser", () => ({ worker: { start } }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Providers", () => {
  it("renders immediately when API mode is selected", () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "api");

    render(<Providers>Conteúdo</Providers>);

    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("starts the browser worker before rendering mock-backed content", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "mock");

    render(<Providers>Conteúdo simulado</Providers>);

    expect(screen.getByRole("status")).toHaveTextContent("Preparando dados de demonstração");
    expect(await screen.findByText("Conteúdo simulado")).toBeInTheDocument();
    expect(start).toHaveBeenCalledWith({ onUnhandledRequest: "bypass" });
  });
});
