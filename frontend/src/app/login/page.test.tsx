import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, vi } from "vitest";

import LoginPage from "./page";

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  status: "visitor" as const,
}));

const replace = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: () => ({
    admin: undefined,
    login: auth.login,
    logout: vi.fn(),
    request: vi.fn(),
    status: auth.status,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  auth.login.mockReset();
  replace.mockReset();
});

describe("LoginPage", () => {
  it("submits an accessible administrator login form", async () => {
    const user = userEvent.setup();
    auth.login.mockResolvedValue(undefined);
    const { container } = render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "admin@example.test");
    await user.type(screen.getByLabelText("Senha"), "demo-only-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(auth.login).toHaveBeenCalledWith({
      email: "admin@example.test",
      password: "demo-only-password",
    });
    expect(replace).toHaveBeenCalledWith("/workshops");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a generic error without revealing which credential failed", async () => {
    const user = userEvent.setup();
    auth.login.mockRejectedValue(new Error("E-mail não encontrado"));
    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "unknown@example.test");
    await user.type(screen.getByLabelText("Senha"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível entrar. Verifique suas credenciais e tente novamente.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("E-mail não encontrado");
  });
});
