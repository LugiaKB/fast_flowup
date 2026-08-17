import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { EmptyState, ErrorState } from "./feedback";
import { LoadingState } from "./skeleton";

describe("feedback states", () => {
  it("announces loading state with the supplied label", () => {
    render(<LoadingState label="Carregando colaboradores" />);

    expect(screen.getByLabelText("Carregando colaboradores")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("offers an optional retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState description="A API não respondeu." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <EmptyState title="Nenhum resultado" description="Tente ajustar os termos da busca." />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
