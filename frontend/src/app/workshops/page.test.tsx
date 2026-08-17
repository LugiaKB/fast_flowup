import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopsPage from "./page";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("WorkshopsPage", () => {
  it("lists workshops from newest to oldest without accessibility violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkshopsPage />);

    expect(screen.getByLabelText("Carregando workshops")).toHaveAttribute("aria-busy", "true");
    await screen.findByRole("heading", { name: "Comunicação que conecta" });
    const workshopHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(workshopHeadings.map(({ textContent }) => textContent)).toEqual([
      "Comunicação que conecta",
      "Feedback sem ruído",
      "Planejamento colaborativo",
      "Segurança psicológica",
      "Decisões orientadas por dados",
      "Facilitação de reuniões",
    ]);
    expect(screen.queryByRole("heading", { name: "Gestão do tempo em equipe" })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(await screen.findByRole("heading", { name: "Gestão do tempo em equipe" })).toBeInTheDocument();
  }, 10_000);

  it("filters workshops after the search debounce", async () => {
    const user = userEvent.setup();
    render(<WorkshopsPage />);
    const search = screen.getByRole("searchbox", { name: "Buscar workshops" });
    await screen.findByRole("heading", { name: "Feedback sem ruído" });

    await user.type(search, "Feedback");

    expect(await screen.findByText("1 workshop encontrado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Feedback sem ruído" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Comunicação que conecta" })).not.toBeInTheDocument();
  });
});
