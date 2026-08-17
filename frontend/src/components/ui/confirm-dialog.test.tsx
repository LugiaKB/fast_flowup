import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";

function renderDialog(onConfirm = vi.fn()) {
  return render(
    <ConfirmDialog
      title="Arquivar colaborador?"
      description="O colaborador deixará de aparecer nas consultas públicas."
      confirmLabel="Arquivar"
      onConfirm={onConfirm}
      trigger={<Button>Solicitar arquivamento</Button>}
    />,
  );
}

describe("ConfirmDialog", () => {
  it("cancels without invoking the destructive action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog(onConfirm);
    const trigger = screen.getByRole("button", { name: "Solicitar arquivamento" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("confirms the action and exposes accessible context", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const { container } = renderDialog(onConfirm);

    await user.click(screen.getByRole("button", { name: "Solicitar arquivamento" }));
    expect(
      screen.getByRole("alertdialog", {
        name: "Arquivar colaborador?",
        description: /deixará de aparecer nas consultas públicas/i,
      }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
