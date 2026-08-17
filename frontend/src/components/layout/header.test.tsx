import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, vi } from "vitest";

import { Header } from "./header";

const auth = vi.hoisted(() => ({
  admin: undefined as { id: string; email: string } | undefined,
  logout: vi.fn(),
  status: "visitor" as "loading" | "visitor" | "authenticated",
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/workshops" }));
vi.mock("@/features/auth/auth-provider", () => ({ useAuth: () => auth }));

beforeEach(() => {
  auth.admin = undefined;
  auth.logout.mockReset();
  auth.status = "visitor";
});

describe("Header", () => {
  it("marks the current public route", () => {
    render(<Header />);

    const currentLinks = screen
      .getAllByText("Workshops")
      .filter((element) => element.getAttribute("aria-current") === "page");
    expect(currentLinks).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Workshops FAST" })).toHaveAttribute(
      "href",
      "/workshops",
    );
  });

  it("closes the mobile menu with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const trigger = screen.getByRole("button", { name: "Abrir menu de navegação" });

    await user.click(trigger);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Colaboradores" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows the administrator and logout control only in an authenticated session", async () => {
    const user = userEvent.setup();
    auth.admin = { id: "admin-1", email: "admin@example.test" };
    auth.status = "authenticated";

    render(<Header />);

    expect(screen.getByText("admin@example.test")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<Header />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
