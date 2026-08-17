import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { Badge } from "./badge";
import { Card } from "./card";

describe("display primitives", () => {
  it("renders status text and preserves card attributes", () => {
    render(
      <Card aria-label="Colaborador">
        <Badge tone="success">Ativo</Badge>
      </Card>,
    );

    expect(screen.getByLabelText("Colaborador")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("uses subtle card motion without layout shift and disables it for reduced motion", () => {
    render(<Card aria-label="Card interativo">Conteúdo</Card>);

    expect(screen.getByLabelText("Card interativo")).toHaveClass(
      "transition-[border-color,box-shadow,transform]",
      "duration-300",
      "ease-out",
      "hover:-translate-y-0.5",
      "hover:border-primary/40",
      "hover:shadow-card-hover",
      "motion-reduce:transform-none",
      "motion-reduce:transition-none",
    );
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <Card>
        <Badge tone="warning">Atenção</Badge>
      </Card>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
