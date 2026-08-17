import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";

import { Button } from "./button";
import { Sheet } from "./sheet";

function SheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Editar colaborador"
      description="Atualize os dados e salve as alterações."
      trigger={<Button>Editar</Button>}
    >
      <Button>Salvar</Button>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("closes with Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<SheetExample />);
    const trigger = screen.getByRole("button", { name: "Editar" });

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Editar colaborador" })).toBeInTheDocument();

    const close = screen.getByRole("button", { name: "Fechar painel" });
    const save = screen.getByRole("button", { name: "Salvar" });
    expect(close).toHaveFocus();
    await user.tab();
    expect(save).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("has an accessible title and description", async () => {
    const user = userEvent.setup();
    const { container } = render(<SheetExample />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(
      screen.getByRole("dialog", { name: "Editar colaborador", description: /atualize os dados/i }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses transform-based entry and exit motion with a reduced-motion fallback", async () => {
    const user = userEvent.setup();
    render(<SheetExample />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByRole("dialog", { name: "Editar colaborador" })).toHaveClass(
      "sheet-content",
    );
    expect(document.querySelector("[data-state='open'].sheet-overlay")).toBeInTheDocument();

    const stylesheet = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(stylesheet).toContain("@keyframes sheet-enter");
    expect(stylesheet).toContain("@keyframes sheet-exit");
    expect(stylesheet).toContain("transform: translateX(100%)");
    expect(stylesheet).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*\.sheet-content[\s\S]*animation: none/,
    );
  });
});
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
