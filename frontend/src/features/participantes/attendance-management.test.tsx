import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";

import WorkshopDetailPage from "@/app/workshops/[id]/page";
import { ToastProvider } from "@/components/ui";
import {
  createAuthenticatedRequest,
  loginAdmin,
  type AdminSummary,
} from "@/features/auth/auth-client";
import { apiRequest } from "@/lib/api/client";

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
  it("replaces attendance and supports individual add and remove operations", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <WorkshopDetailPage />
      </ToastProvider>,
    );
    await screen.findByRole("heading", { name: "Ana Beatriz" });

    await user.click(screen.getByRole("button", { name: "Gerenciar participantes" }));
    const dialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });
    await user.click(within(dialog).getByRole("checkbox", { name: "Ana Beatriz" }));
    await user.click(within(dialog).getByRole("checkbox", { name: "Helena Martins" }));
    await user.click(within(dialog).getByRole("button", { name: "Salvar participantes" }));

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Ana Beatriz" })).not.toBeInTheDocument(),
    );
    expect(await screen.findByRole("heading", { name: "Helena Martins" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Gerenciar participantes" }));
    const quickDialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });
    await user.click(within(quickDialog).getByRole("button", { name: "Remover Carlos Eduardo" }));
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Carlos Eduardo" })).not.toBeInTheDocument(),
    );

    await user.click(await screen.findByRole("button", { name: "Gerenciar participantes" }));
    const addDialog = screen.getByRole("dialog", { name: "Gerenciar participantes" });
    await user.selectOptions(within(addDialog).getByLabelText("Colaborador para adicionar"), "7");
    await user.click(within(addDialog).getByRole("button", { name: "Adicionar participante" }));
    expect(await screen.findByRole("heading", { name: "Larissa Gomes" })).toBeInTheDocument();
  }, 15_000);

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
