import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopsPage from "@/app/workshops/page";
import { ToastProvider } from "@/components/ui";
import {
  createAuthenticatedRequest,
  loginAdmin,
  type AdminSummary,
} from "@/features/auth/auth-client";
import type { components } from "@/lib/api/schema";

type WorkshopDetail = components["schemas"]["WorkshopDetail"];

const auth = vi.hoisted(() => ({
  admin: { id: "admin-1", username: "gestor" } as AdminSummary | undefined,
  login: vi.fn(),
  logout: vi.fn(),
  request: undefined as unknown as ReturnType<typeof createAuthenticatedRequest>,
  status: "authenticated" as "loading" | "visitor" | "authenticated",
}));

vi.mock("@/features/auth/auth-provider", () => ({ useAuth: () => auth }));

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  const session = await loginAdmin({ username: "gestor", password: "qualquer-senha" });
  let accessToken = session.accessToken;
  auth.admin = session.admin;
  auth.status = "authenticated";
  auth.request = createAuthenticatedRequest({
    getAccessToken: () => accessToken,
    onSession: (renewed) => {
      accessToken = renewed.accessToken;
    },
    onSessionLost: () => {
      accessToken = "";
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
      <WorkshopsPage />
    </ToastProvider>,
  );
}

function cardFor(name: string) {
  const card = screen.getByRole("heading", { name }).closest("li");
  if (!card) throw new Error(`Card de ${name} não encontrado`);
  return within(card);
}

describe("workshop management", () => {
  it("creates, edits, archives, filters and restores a workshop", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await screen.findByRole("heading", { name: "Comunicação que conecta" });

    await user.click(screen.getByRole("button", { name: "Novo workshop" }));
    const createDialog = screen.getByRole("dialog", { name: "Novo workshop" });
    await user.type(within(createDialog).getByRole("textbox", { name: "Nome" }), "Cultura de aprendizado");
    await user.type(within(createDialog).getByLabelText("Data de realização"), "2027-01-07");
    await user.type(
      within(createDialog).getByRole("textbox", { name: "Descrição" }),
      "Práticas para compartilhar aprendizados entre equipes.",
    );
    await user.click(within(createDialog).getByRole("button", { name: "Salvar workshop" }));

    expect(await screen.findByText("Workshop criado")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Cultura de aprendizado" })).toBeInTheDocument();

    await user.click(
      cardFor("Cultura de aprendizado").getByRole("button", { name: "Editar Cultura de aprendizado" }),
    );
    const editDialog = screen.getByRole("dialog", { name: "Editar workshop" });
    const nameField = within(editDialog).getByRole("textbox", { name: "Nome" });
    await user.clear(nameField);
    await user.type(nameField, "Cultura de aprendizado contínuo");
    await user.click(within(editDialog).getByRole("button", { name: "Salvar alterações" }));
    expect(
      await screen.findByRole("heading", { name: "Cultura de aprendizado contínuo" }),
    ).toBeInTheDocument();

    await user.click(
      cardFor("Cultura de aprendizado contínuo").getByRole("button", {
        name: "Arquivar Cultura de aprendizado contínuo",
      }),
    );
    const archiveDialog = screen.getByRole("alertdialog", {
      name: "Arquivar Cultura de aprendizado contínuo?",
    });
    await user.selectOptions(within(archiveDialog).getByLabelText("Motivo do arquivamento"), "manual");
    await user.click(within(archiveDialog).getByRole("button", { name: /^Arquivar$/ }));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Cultura de aprendizado contínuo" }),
      ).not.toBeInTheDocument(),
    );

    await user.selectOptions(screen.getByLabelText("Status dos workshops"), "archived");
    expect(
      await screen.findByRole("heading", { name: "Cultura de aprendizado contínuo" }),
    ).toBeInTheDocument();
    await user.click(
      cardFor("Cultura de aprendizado contínuo").getByRole("button", {
        name: "Restaurar Cultura de aprendizado contínuo",
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Cultura de aprendizado contínuo" }),
      ).not.toBeInTheDocument(),
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15_000);

  it("links a replacement and rejects restoration into its occupied quarter", async () => {
    await auth.request<void>("/api/workshops/1", {
      method: "DELETE",
      body: { reason: "replacement" },
    });
    const replacement = await auth.request<WorkshopDetail>("/api/workshops", {
      method: "POST",
      body: {
        nome: "Workshop substituto",
        descricao: "Substituição planejada.",
        dataRealizacao: "2026-08-20T16:00:00-03:00",
        substituiWorkshopId: 1,
      },
    });
    const predecessor = await auth.request<WorkshopDetail>("/api/workshops/1");
    expect(predecessor.archiveEvents.at(-1)?.replacementWorkshopId).toBe(replacement.id);

    await expect(
      auth.request("/api/workshops/1/restaurar", { method: "POST" }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
