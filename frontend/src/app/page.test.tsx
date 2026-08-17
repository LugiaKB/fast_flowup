import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import Home from "./page";

describe("Home", () => {
  it("renders the application scaffold", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Workshops FAST" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("passes the accessibility smoke test", async () => {
    const { container } = render(<Home />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
