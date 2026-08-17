import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopDetailPage from "./page";

const route = vi.hoisted(() => ({ id: "1" }));

vi.mock("next/navigation", () => ({ useParams: () => ({ id: route.id }) }));
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
  route.id = "1";
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("WorkshopDetailPage", () => {
  it("shows workshop data and only active participants", async () => {
    const { container } = render(<WorkshopDetailPage />);

    expect(await screen.findByRole("heading", { name: "Comunicação que conecta" })).toBeInTheDocument();
    expect(screen.getByText("16 de julho de 2026")).toBeInTheDocument();
    expect(screen.getByText("16h–17h")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ana Beatriz" })).toBeInTheDocument();
    expect(screen.queryByText("Marina Arquivada")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a specific empty participant state", async () => {
    route.id = "3";

    render(<WorkshopDetailPage />);

    expect(await screen.findByRole("heading", { name: "Nenhum participante registrado" })).toBeInTheDocument();
  });

  it("shows a not-found state for an absent workshop", async () => {
    route.id = "999";

    render(<WorkshopDetailPage />);

    expect(await screen.findByRole("heading", { name: "Workshop não encontrado" })).toBeInTheDocument();
  });
});
