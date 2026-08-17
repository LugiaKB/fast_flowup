import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Button } from "./button";
import { ToastProvider, useToast } from "./toast";

function ToastExample() {
  const { notify } = useToast();

  return (
    <Button
      onClick={() =>
        notify({ title: "Alterações salvas", description: "O colaborador foi atualizado." })
      }
    >
      Salvar
    </Button>
  );
}

describe("ToastProvider", () => {
  it("announces and closes a notification", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Alterações salvas")).toBeInTheDocument();
    expect(screen.getByText("O colaborador foi atualizado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(screen.queryByText("Alterações salvas")).not.toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ToastProvider>
        <ToastExample />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
