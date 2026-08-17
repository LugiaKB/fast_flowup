import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { Button } from "./button";
import { SearchField, TextField } from "./field";

describe("form controls", () => {
  it("associates labels and validation messages with inputs", () => {
    render(<TextField label="Nome" error="Informe o nome" />);

    const input = screen.getByRole("textbox", { name: "Nome" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Informe o nome");
  });

  it("uses safe button defaults and labels search fields", () => {
    render(
      <div>
        <SearchField label="Buscar" />
        <Button>Continuar</Button>
      </div>,
    );

    expect(screen.getByRole("searchbox", { name: "Buscar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toHaveAttribute("type", "button");
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <div>
        <SearchField label="Buscar" hint="Digite parte do nome" />
        <Button variant="danger">Arquivar</Button>
      </div>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
