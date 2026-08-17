import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { Header } from "./header";

vi.mock("next/navigation", () => ({ usePathname: () => "/workshops" }));

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

  it("has no automated accessibility violations", async () => {
    const { container } = render(<Header />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
