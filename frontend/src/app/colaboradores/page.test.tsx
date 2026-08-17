import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { afterEach, beforeEach, vi } from "vitest";

import { server } from "@/mocks/server";

import ColaboradoresPage from "./page";

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: () => ({
    admin: undefined,
    login: vi.fn(),
    logout: vi.fn(),
    request: vi.fn(),
    status: "visitor",
  }),
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ColaboradoresPage", () => {
  it("renders public collaborators without accessibility violations", async () => {
    const { container } = render(<ColaboradoresPage />);

    expect(screen.getByLabelText("Carregando colaboradores")).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("heading", { name: "Ana Beatriz" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar colaboradores" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows an empty state without presenting it as a failure", async () => {
    server.use(
      http.get("http://api.test/api/colaboradores", () =>
        HttpResponse.json({ items: [], totalItems: 0, offset: 0, limit: 6 }),
      ),
    );

    render(<ColaboradoresPage />);

    expect(await screen.findByRole("heading", { name: "Nenhum colaborador encontrado" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an actionable error state", async () => {
    server.use(
      http.get("http://api.test/api/colaboradores", () =>
        HttpResponse.json(
          {
            type: "about:blank",
            title: "Falha temporária",
            status: 503,
            code: "service_unavailable",
          },
          { status: 503 },
        ),
      ),
    );

    render(<ColaboradoresPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Tente novamente");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeEnabled();
  });

  it("filters collaborators after the search debounce", async () => {
    const user = userEvent.setup();
    render(<ColaboradoresPage />);
    const search = screen.getByRole("searchbox", { name: "Buscar colaboradores" });
    await screen.findByRole("heading", { name: "Carlos Eduardo" });

    await user.type(search, "Ana");

    expect(await screen.findByText("1 colaborador encontrado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ana Beatriz" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Carlos Eduardo" })).not.toBeInTheDocument();
  });
});
