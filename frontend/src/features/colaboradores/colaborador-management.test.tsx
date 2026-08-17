import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, vi } from "vitest";

import ColaboradoresPage from "@/app/colaboradores/page";
import { ToastProvider } from "@/components/ui";
import {
  createAuthenticatedRequest,
  loginAdmin,
  type AdminSummary,
} from "@/features/auth/auth-client";
import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

type WorkshopDetail = components["schemas"]["WorkshopDetail"];

const auth = vi.hoisted(() => ({
  admin: { id: "admin-1", username: "revisor" } as AdminSummary | undefined,
  login: vi.fn(),
  logout: vi.fn(),
  request: undefined as unknown as ReturnType<typeof createAuthenticatedRequest>,
  status: "authenticated" as "loading" | "visitor" | "authenticated",
}));

vi.mock("@/features/auth/auth-provider", () => ({ useAuth: () => auth }));

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  const session = await loginAdmin({ username: "revisor", password: "senha-livre" });
  let accessToken = session.accessToken;

  auth.admin = session.admin;
  auth.status = "authenticated";
  auth.request = createAuthenticatedRequest({
    getAccessToken: () => accessToken,
    onSession: (renewedSession) => {
      accessToken = renewedSession.accessToken;
    },
    onSessionLost: () => {
      accessToken = "";
      auth.admin = undefined;
      auth.status = "visitor";
    },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderPage() {
  return render(
    <ToastProvider>
      <ColaboradoresPage />
    </ToastProvider>,
  );
}

function cardFor(name: string) {
  const card = screen.getByRole("heading", { name }).closest("li");
  if (!card) throw new Error(`Card de ${name} não encontrado`);
  return within(card);
}

describe("collaborator management", () => {
  it("creates, edits, archives, filters and restores a collaborator", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await screen.findByRole("heading", { name: "Ana Beatriz" });

    expect(screen.getByRole("combobox", { name: "Status dos colaboradores" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Novo colaborador" }));

    const createDialog = screen.getByRole("dialog", { name: "Novo colaborador" });
    await user.click(within(createDialog).getByRole("button", { name: "Salvar colaborador" }));
    expect(within(createDialog).getByRole("alert")).toHaveTextContent("Revise os campos");
    expect(within(createDialog).getByRole("textbox", { name: "Nome" })).toHaveAccessibleDescription(
      "Informe o nome do colaborador.",
    );

    await user.type(within(createDialog).getByRole("textbox", { name: "Nome" }), "Aline Nova");
    await user.click(within(createDialog).getByRole("button", { name: "Salvar colaborador" }));

    expect(await screen.findByText("Colaborador criado")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Aline Nova" })).toBeInTheDocument();

    await user.click(cardFor("Aline Nova").getByRole("button", { name: "Editar Aline Nova" }));
    const editDialog = screen.getByRole("dialog", { name: "Editar colaborador" });
    const nameField = within(editDialog).getByRole("textbox", { name: "Nome" });
    await user.clear(nameField);
    await user.type(nameField, "Alice Atualizada");
    await user.click(within(editDialog).getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("heading", { name: "Alice Atualizada" })).toBeInTheDocument();
    await user.click(
      cardFor("Alice Atualizada").getByRole("button", { name: "Arquivar Alice Atualizada" }),
    );
    expect(
      screen.getByRole("alertdialog", { name: "Arquivar Alice Atualizada?" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Arquivar$/ }));

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Alice Atualizada" })).not.toBeInTheDocument(),
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status dos colaboradores" }),
      "archived",
    );
    expect(await screen.findByRole("heading", { name: "Alice Atualizada" })).toBeInTheDocument();
    await user.click(
      cardFor("Alice Atualizada").getByRole("button", { name: "Restaurar Alice Atualizada" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Alice Atualizada" })).not.toBeInTheDocument(),
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status dos colaboradores" }),
      "active",
    );
    expect(await screen.findByRole("heading", { name: "Alice Atualizada" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  }, 15_000);

  it("keeps all administrative controls out of the visitor DOM", async () => {
    auth.admin = undefined;
    auth.status = "visitor";
    renderPage();

    await screen.findByRole("heading", { name: "Ana Beatriz" });
    expect(screen.queryByRole("button", { name: "Novo colaborador" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Status dos colaboradores" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Editar / })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Arquivar / })).not.toBeInTheDocument();
  });

  it("requires bearer authorization for mutations and archived queries", async () => {
    await expect(
      apiRequest("/api/colaboradores", { method: "POST", body: { nome: "Sem autorização" } }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      apiRequest("/api/colaboradores?offset=0&limit=20&status=archived"),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("preserves attendance while an existing collaborator is archived", async () => {
    await auth.request<void>("/api/colaboradores/1", { method: "DELETE" });

    const archivedDetail = await apiRequest<WorkshopDetail>("/api/workshops/1");
    expect(archivedDetail.participantes.map(({ nome }) => nome)).not.toContain("Ana Beatriz");

    await auth.request("/api/colaboradores/1/restaurar", { method: "POST" });
    const restoredDetail = await apiRequest<WorkshopDetail>("/api/workshops/1");
    expect(restoredDetail.participantes.map(({ nome }) => nome)).toContain("Ana Beatriz");
  });
});
