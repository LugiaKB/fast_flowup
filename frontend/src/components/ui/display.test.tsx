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

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <Card>
        <Badge tone="warning">Atenção</Badge>
      </Card>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
