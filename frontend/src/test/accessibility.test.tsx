import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { beforeEach, vi } from "vitest";

import { Header } from "@/components/layout/header";
import { Button, Sheet } from "@/components/ui";
import { ThemeProvider } from "@/features/theme/theme-provider";

const auth = vi.hoisted(() => ({
  admin: undefined,
  logout: vi.fn(),
  status: "visitor" as const,
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/workshops" }));
vi.mock("@/features/auth/auth-provider", () => ({ useAuth: () => auth }));

function KeyboardExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Header />
      <main id="main-content">
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title="Gerenciar participantes"
          description="Selecione as pessoas participantes."
          trigger={<Button>Abrir painel</Button>}
        >
          <Button>Salvar</Button>
        </Sheet>
      </main>
    </>
  );
}

function renderExample() {
  return render(
    <ThemeProvider>
      <KeyboardExample />
    </ThemeProvider>,
  );
}

beforeEach(() => auth.logout.mockReset());

describe("frontend accessibility quality gate", () => {
  it("supports keyboard navigation in the mobile menu and modal sheet", async () => {
    const user = userEvent.setup();
    renderExample();

    const menuTrigger = screen.getByRole("button", { name: "Abrir menu de navegação" });
    await user.click(menuTrigger);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Colaboradores" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(menuTrigger).toHaveFocus();

    const sheetTrigger = screen.getByRole("button", { name: "Abrir painel" });
    await user.click(sheetTrigger);
    expect(screen.getByRole("button", { name: "Fechar painel" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Fechar painel" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(sheetTrigger).toHaveFocus();
  });

  it("provides responsive alternatives and an accessible document structure", async () => {
    const { container } = renderExample();

    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByLabelText("Navegação principal")).toHaveClass("hidden", "md:flex");
    expect(screen.getByRole("button", { name: "Abrir menu de navegação" }).parentElement).toHaveClass(
      "md:hidden",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defines responsive layout tokens and disables motion when requested", () => {
    const stylesheet = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

    expect(stylesheet).toContain("@media (min-width: 48rem)");
    expect(stylesheet).toContain("--header-height: 4.5rem");
    expect(stylesheet).toContain("@media (min-width: 64rem)");
    expect(stylesheet).toContain("--container-padding: 2.5rem");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toContain("transition-duration: 0.01ms !important");
  });

  it.each(["light", "dark"] as const)(
    "has no automated accessibility violations in the %s theme",
    async (theme) => {
      localStorage.setItem("workshops-fast-theme", theme);
      document.documentElement.dataset.theme = theme;

      const { container } = renderExample();

      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
