import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopsPage from "@/app/workshops/page";
import { ToastProvider } from "@/components/ui";
import {
  createAuthenticatedRequest,
  loginAdmin,
  type AdminSummary,
} from "@/features/auth/auth-client";
import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { server } from "@/mocks/server";
import { workshopsFixture } from "@/mocks/fixtures";

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
  it("creates a workshop with searched active participants and preserves selection", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { name: "Comunicação que conecta" });

    await user.click(screen.getByRole("button", { name: "Novo workshop" }));
    const dialog = screen.getByRole("dialog", { name: "Novo workshop" });
    const search = within(dialog).getByRole("searchbox", { name: "Buscar participantes" });

    await user.type(search, "Helena");
    await user.click(await within(dialog).findByRole("checkbox", { name: "Helena Martins" }));
    expect(within(dialog).getByText("1 participante selecionado")).toBeInTheDocument();

    await user.clear(search);
    expect(await within(dialog).findByRole("checkbox", { name: "Helena Martins" })).toBeChecked();
    await user.type(search, "Larissa");
    await user.click(await within(dialog).findByRole("checkbox", { name: "Larissa Gomes" }));
    expect(within(dialog).getByText("2 participantes selecionados")).toBeInTheDocument();

    await user.clear(search);
    expect(await within(dialog).findByRole("checkbox", { name: "Helena Martins" })).toBeChecked();
    expect(within(dialog).getByRole("checkbox", { name: "Larissa Gomes" })).toBeChecked();
    expect(within(dialog).queryByRole("checkbox", { name: "Marina Arquivada" })).not.toBeInTheDocument();
    expect(await axe(dialog)).toHaveNoViolations();

    await user.type(within(dialog).getByRole("textbox", { name: "Nome" }), "Liderança colaborativa");
    await user.type(within(dialog).getByLabelText("Data de realização"), "2027-04-08");
    await user.type(
      within(dialog).getByRole("textbox", { name: "Descrição" }),
      "Decisões compartilhadas e acordos claros para líderes.",
    );
    await user.click(within(dialog).getByRole("button", { name: "Salvar workshop" }));

    expect(await screen.findByText("Workshop criado")).toBeInTheDocument();
    const createdCard = cardFor("Liderança colaborativa");
    expect(createdCard.getByText("2 participantes")).toBeInTheDocument();
    const detailLink = createdCard.getByRole("link", {
      name: "Ver detalhes de Liderança colaborativa",
    });
    const createdId = Number(detailLink.getAttribute("href")?.split("/").at(-1));
    const detail = await auth.request<WorkshopDetail>(
      `/api/workshops/${createdId}`,
    );
    expect(detail.participantes.map(({ nome }) => nome)).toEqual([
      "Helena Martins",
      "Larissa Gomes",
    ]);
  }, 15_000);

  it("rejects duplicate, archived and unauthorized initial participants atomically", async () => {
    const validWorkshop = {
      nome: "Workshop protegido",
      descricao: "Validação de participantes na criação.",
      dataRealizacao: "2027-07-08T16:00:00-03:00",
    };

    await expect(
      auth.request("/api/workshops", {
        method: "POST",
        body: { ...validWorkshop, colaboradorIds: [1, 1] },
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      auth.request("/api/workshops", {
        method: "POST",
        body: { ...validWorkshop, colaboradorIds: [9] },
      }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      apiRequest("/api/workshops", {
        method: "POST",
        body: { ...validWorkshop, colaboradorIds: [1] },
      }),
    ).rejects.toMatchObject({ status: 401 });

    const list = await auth.request<components["schemas"]["PagedWorkshops"]>(
      "/api/workshops?query=Workshop%20protegido&offset=0&limit=20&status=active",
    );
    expect(list.totalItems).toBe(0);
  });

  it("loads, searches and saves workshop participants from the edit panel", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("heading", { name: "Comunicação que conecta" });

    await user.click(
      cardFor("Comunicação que conecta").getByRole("button", {
        name: "Editar Comunicação que conecta",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Editar workshop" });
    expect(
      within(dialog).getByRole("heading", { name: "Participantes do workshop" }),
    ).toBeInTheDocument();

    const ana = await within(dialog).findByRole("checkbox", { name: /Ana Beatriz/ });
    expect(ana).toBeChecked();
    expect(within(dialog).getAllByText("Já participa")).toHaveLength(4);

    const search = within(dialog).getByRole("searchbox", { name: "Buscar participantes" });
    await user.type(search, "Helena");
    const helena = await within(dialog).findByRole("checkbox", { name: "Helena Martins" });
    expect(helena).not.toBeChecked();
    await user.click(helena);

    await user.clear(search);
    expect(await within(dialog).findByRole("checkbox", { name: "Helena Martins" })).toBeChecked();
    await user.click(within(dialog).getByRole("checkbox", { name: /Carlos Eduardo/ }));
    expect(within(dialog).getByText("4 participantes selecionados")).toBeInTheDocument();
    expect(within(dialog).queryByRole("checkbox", { name: "Marina Arquivada" })).not.toBeInTheDocument();

    const name = within(dialog).getByRole("textbox", { name: "Nome" });
    await user.clear(name);
    await user.type(name, "Comunicação que conecta atualizada");
    await user.click(within(dialog).getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("Workshop e participantes atualizados")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Comunicação que conecta atualizada" }),
    ).toBeInTheDocument();
    const detail = await auth.request<WorkshopDetail>("/api/workshops/1");
    expect(detail.participantCount).toBe(4);
    expect(detail.participantes.map(({ id }) => id)).toEqual([1, 3, 4, 5]);
  }, 15_000);

  it("announces initial participant loading before enabling edit selection", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("http://api.test/api/workshops/1", async () => {
        await delay(100);
        return HttpResponse.json(workshopsFixture[0]);
      }),
    );
    renderPage();
    await screen.findByRole("heading", { name: "Comunicação que conecta" });

    await user.click(
      cardFor("Comunicação que conecta").getByRole("button", {
        name: "Editar Comunicação que conecta",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Editar workshop" });
    expect(within(dialog).getByText("Carregando participantes atuais…")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
    expect(await within(dialog).findByRole("checkbox", { name: /Ana Beatriz/ })).toBeChecked();
  });

  it("reports and revalidates a partial edit failure when participant replacement fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.put("http://api.test/api/workshops/1/participantes", () =>
        HttpResponse.json(
          { title: "Falha ao atualizar participantes", detail: "Tente novamente." },
          { status: 500 },
        ),
      ),
    );
    renderPage();
    await screen.findByRole("heading", { name: "Comunicação que conecta" });

    await user.click(
      cardFor("Comunicação que conecta").getByRole("button", {
        name: "Editar Comunicação que conecta",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Editar workshop" });
    const search = within(dialog).getByRole("searchbox", { name: "Buscar participantes" });
    await user.type(search, "Helena");
    const helena = await within(dialog).findByRole("checkbox", { name: "Helena Martins" });
    await user.click(helena);
    const name = within(dialog).getByRole("textbox", { name: "Nome" });
    await user.clear(name);
    await user.type(name, "Comunicação parcialmente atualizada");
    await user.click(within(dialog).getByRole("button", { name: "Salvar alterações" }));

    expect(
      await within(dialog).findByText(
        "Os dados do workshop foram salvos, mas não foi possível atualizar os participantes. A lista foi recarregada.",
        {},
        { timeout: 5_000 },
      ),
    ).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    await waitFor(async () =>
      expect((await auth.request<WorkshopDetail>("/api/workshops/1")).nome).toBe(
        "Comunicação parcialmente atualizada",
      ),
    );
    expect((await auth.request<WorkshopDetail>("/api/workshops/1")).participantCount).toBe(4);
  }, 15_000);

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
