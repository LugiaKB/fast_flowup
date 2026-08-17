import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopDetailPage from "@/app/workshops/[id]/page";
import { ToastProvider } from "@/components/ui";
import {
  createAuthenticatedRequest,
  loginAdmin,
  type AdminSummary,
} from "@/features/auth/auth-client";
import { apiRequest } from "@/lib/api/client";
import { server } from "@/mocks/server";

const auth = vi.hoisted(() => ({
  admin: { id: "admin-1", username: "gestor" } as AdminSummary | undefined,
  login: vi.fn(),
  logout: vi.fn(),
  request: undefined as unknown as ReturnType<typeof createAuthenticatedRequest>,
  status: "authenticated" as "loading" | "visitor" | "authenticated",
}));

vi.mock("next/navigation", () => ({ useParams: () => ({ id: "1" }) }));
vi.mock("@/features/auth/auth-provider", () => ({ useAuth: () => auth }));

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  const session = await loginAdmin({ username: "gestor", password: "senha-livre" });
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
    },
  });
});

afterEach(() => vi.unstubAllEnvs());

describe("attendance management", () => {
  it("searches collaborators without losing the selection or offering duplicates", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <WorkshopDetailPage />
      </ToastProvider>,
    );
    await screen.findByRole("heading", { name: "Ana Beatriz" });

    await user.click(screen.getByRole("button", { name: "Gerenciar participantes" }));
    const dialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });
    expect(
      within(dialog).getByRole("option", { name: "Ana Beatriz" }),
    ).toBeDisabled();

    await user.type(within(dialog).getByRole("searchbox", { name: "Buscar colaboradores" }), "Helena");
    expect(await within(dialog).findByRole("checkbox", { name: "Helena Martins" })).toBeVisible();
    expect(within(dialog).queryByRole("checkbox", { name: "Ana Beatriz" })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("checkbox", { name: "Helena Martins" }));

    await user.clear(within(dialog).getByRole("searchbox", { name: "Buscar colaboradores" }));
    expect(await within(dialog).findByRole("checkbox", { name: "Ana Beatriz" })).toBeChecked();
    expect(within(dialog).getByRole("checkbox", { name: "Helena Martins" })).toBeChecked();
    await user.click(within(dialog).getByRole("button", { name: "Salvar participantes" }));

    expect(screen.getByRole("dialog", { name: "Gerenciar participantes" })).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Remover Helena Martins" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Helena Martins", hidden: true }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Participantes atualizados")).toBeInTheDocument();
  }, 15_000);

  it("adds and removes participants immediately while preserving the open panel", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <WorkshopDetailPage />
      </ToastProvider>,
    );
    await screen.findByRole("heading", { name: "Ana Beatriz" });

    await user.click(screen.getByRole("button", { name: "Gerenciar participantes" }));
    const dialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });
    await user.type(within(dialog).getByRole("searchbox", { name: "Buscar colaboradores" }), "Larissa");
    await user.selectOptions(
      within(dialog).getByLabelText("Colaborador para adicionar"),
      "7",
    );
    await user.click(within(dialog).getByRole("button", { name: "Adicionar participante" }));

    expect(screen.getByRole("dialog", { name: "Gerenciar participantes" })).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Remover Larissa Gomes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Larissa Gomes", hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Quantidade de participantes", { selector: "p" }),
    ).toHaveTextContent("5 participantes");
    expect(await screen.findByText("Participante adicionado")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Remover Carlos Eduardo" }));
    const confirmation = screen.getByRole("alertdialog", { name: "Remover Carlos Eduardo?" });
    await user.click(within(confirmation).getByRole("button", { name: "Remover" }));

    expect(screen.getByRole("dialog", { name: "Gerenciar participantes" })).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Carlos Eduardo" })).not.toBeInTheDocument(),
    );
    expect(within(dialog).queryByRole("button", { name: "Remover Carlos Eduardo" })).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Quantidade de participantes", { selector: "p" }),
    ).toHaveTextContent("4 participantes");
    expect(await screen.findByText("Participante removido")).toBeInTheDocument();
  }, 15_000);

  it("shows loading and recoverable error feedback while searching", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    server.use(
      http.get("*/api/colaboradores", async ({ request }) => {
        if (new URL(request.url).searchParams.get("query") !== "Falha") return;
        attempts += 1;
        await delay(100);
        if (attempts === 1) {
          return HttpResponse.json(
            { title: "Falha simulada", status: 500 },
            { status: 500 },
          );
        }
        return HttpResponse.json({ items: [], totalItems: 0, offset: 0, limit: 100 });
      }),
    );
    render(
      <ToastProvider>
        <WorkshopDetailPage />
      </ToastProvider>,
    );
    await screen.findByRole("heading", { name: "Ana Beatriz" });
    await user.click(screen.getByRole("button", { name: "Gerenciar participantes" }));
    const dialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });

    await user.type(within(dialog).getByRole("searchbox", { name: "Buscar colaboradores" }), "Falha");
    expect(within(dialog).getByRole("status", { name: "" })).toHaveTextContent(
      "Buscando colaboradores",
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Não foi possível buscar colaboradores",
    );

    await user.click(within(dialog).getByRole("button", { name: "Tentar novamente" }));
    expect(await within(dialog).findByText("Nenhum colaborador encontrado.")).toBeInTheDocument();
    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps attendance controls absent for visitors", async () => {
    auth.status = "visitor";
    render(<WorkshopDetailPage />);
    await screen.findByRole("heading", { name: "Comunicação que conecta" });
    expect(screen.queryByRole("button", { name: "Gerenciar participantes" })).not.toBeInTheDocument();
  });

  it("rejects unauthorized, malformed, missing and inactive participant changes", async () => {
    await expect(
      apiRequest("/api/workshops/1/participantes/7", { method: "PUT" }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      auth.request("/api/workshops/1/participantes", {
        method: "PUT",
        body: { colaboradorIds: [1, 1] },
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      auth.request("/api/workshops/1/participantes/999", { method: "PUT" }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      auth.request("/api/workshops/1/participantes/9", { method: "PUT" }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
