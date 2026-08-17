import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("moves between offsets and exposes the visible range", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination offset={10} limit={10} totalItems={25} onPageChange={onPageChange} />);

    expect(screen.getByText("Exibindo 11–20 de 25")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 0);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 20);
  });

  it("disables navigation at the collection boundaries", () => {
    const { rerender } = render(
      <Pagination offset={0} limit={10} totalItems={10} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();

    rerender(<Pagination offset={0} limit={10} totalItems={0} onPageChange={vi.fn()} />);
    expect(screen.getByText("Exibindo 0–0 de 0")).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <Pagination offset={0} limit={10} totalItems={25} onPageChange={vi.fn()} />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
