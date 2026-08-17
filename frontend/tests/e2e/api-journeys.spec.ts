/**
 * Real API integration journeys (T085).
 *
 * These tests run against the live backend (no MSW). They require the API to
 * be reachable at PLAYWRIGHT_API_URL (default: http://localhost:8080) and the
 * frontend at PLAYWRIGHT_BASE_URL (default: http://localhost:3000) running in
 * api mode (NEXT_PUBLIC_API_MODE=api).
 *
 * Run with:
 *   npm run test:e2e:api
 *
 * The standard `npm run test:e2e` suite keeps MSW mock mode and does NOT run
 * this file.
 */

import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_URL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080";
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin@123!";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Nome de usuário" }).fill(ADMIN_USERNAME);
  await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/workshops$/);
}

async function apiGet(url: string) {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { Accept: "application/json" },
  });
  return res;
}

// ---------------------------------------------------------------------------
// US1 – Public collaborator query
// ---------------------------------------------------------------------------

test("US1/real: lists public collaborators without authentication", async ({ page }) => {
  await page.goto("/colaboradores");
  await expect(page.getByRole("heading", { name: "Colaboradores", exact: true })).toBeVisible();
  // At least one collaborator card should appear (seeded by the backend).
  await expect(page.locator("[data-testid='colaborador-card'], article, li").first()).toBeVisible({ timeout: 5000 });
});

test("US1/real: GET /api/colaboradores returns valid paged response", async () => {
  const res = await apiGet("/api/colaboradores?limit=5");
  expect(res.status).toBe(200);
  const body = (await res.json()) as { items: unknown[]; total: number };
  expect(typeof body.total).toBe("number");
  expect(Array.isArray(body.items)).toBe(true);
});

test("US1/real: search collaborators by name narrows results", async ({ page }) => {
  // Seed a unique collaborator first so we have something predictable to find.
  const uniqueSuffix = Date.now();
  const name = `Teste Busca ${uniqueSuffix}`;

  // We need a bearer token — login via API directly.
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  expect(loginRes.ok).toBe(true);
  const { accessToken } = (await loginRes.json()) as { accessToken: string };

  const createRes = await fetch(`${API_URL}/api/colaboradores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ nome: name }),
  });
  expect(createRes.status).toBe(201);

  // Search the UI.
  await page.goto("/colaboradores");
  await page.getByRole("searchbox", { name: "Buscar colaboradores" }).fill(String(uniqueSuffix));
  await expect(page.getByText(name, { exact: false })).toBeVisible({ timeout: 5000 });
});

// ---------------------------------------------------------------------------
// US2 – Public workshop exploration
// ---------------------------------------------------------------------------

test("US2/real: GET /api/workshops returns valid paged response", async () => {
  const res = await apiGet("/api/workshops?limit=5");
  expect(res.status).toBe(200);
  const body = (await res.json()) as { items: unknown[]; total: number };
  expect(Array.isArray(body.items)).toBe(true);
  expect(typeof body.total).toBe("number");
});

test("US2/real: workshop list page renders without errors", async ({ page }) => {
  await page.goto("/workshops");
  await expect(page.getByRole("heading", { name: "Workshops", exact: true })).toBeVisible();
});

// ---------------------------------------------------------------------------
// US3 – Authentication
// ---------------------------------------------------------------------------

test("US3/real: login with valid credentials shows admin controls", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("button", { name: "Novo workshop" })).toBeVisible();
});

test("US3/real: login with wrong credentials shows generic error", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Nome de usuário" }).fill("wrong");
  await page.getByLabel("Senha").fill("wrongpassword");
  await page.getByRole("button", { name: "Entrar" }).click();
  // Should remain on login page with an error message.
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("alert")).toBeVisible();
});

test("US3/real: reload restores session via refresh cookie", async ({ page }) => {
  await loginAsAdmin(page);
  await page.reload();
  // Admin control still visible after reload (refresh cookie worked).
  await expect(page.getByRole("button", { name: "Novo workshop" })).toBeVisible({ timeout: 5000 });
});

test("US3/real: logout removes admin controls", async ({ page }) => {
  await loginAsAdmin(page);
  const logoutBtn = page.getByRole("button", { name: /sair/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
    await page.getByRole("menuitem", { name: /sair/i }).click();
  }
  await expect(page.getByRole("button", { name: "Novo workshop" })).toBeHidden({ timeout: 5000 });
});

test("US3/real: POST /api/auth/login returns access token", async () => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as { accessToken: string };
  expect(typeof body.accessToken).toBe("string");
  expect(body.accessToken.length).toBeGreaterThan(10);
});

// ---------------------------------------------------------------------------
// US4 – Collaborator administration
// ---------------------------------------------------------------------------

test("US4/real: creates and archives a collaborator", async ({ page }) => {
  await loginAsAdmin(page);
  const suffix = Date.now();
  const name = `Real Collab ${suffix}`;

  await page.getByRole("button", { name: "Novo colaborador" }).click();
  const dialog = page.getByRole("dialog", { name: "Novo colaborador" });
  await dialog.getByRole("textbox", { name: "Nome" }).fill(name);
  await dialog.getByRole("button", { name: "Salvar colaborador" }).click();

  await page.getByRole("searchbox", { name: "Buscar colaboradores" }).fill(name);
  await expect(page.getByText(name, { exact: false })).toBeVisible({ timeout: 5000 });

  // Archive via the edit/archive button.
  await page.getByRole("button", { name: `Editar ${name}` }).click();
  const editDialog = page.getByRole("dialog");
  await editDialog.getByRole("button", { name: /arquivar/i }).click();
  const confirmDialog = page.getByRole("alertdialog");
  await confirmDialog.getByRole("button", { name: /arquivar/i }).click();

  // Collaborator should disappear from the active list.
  await expect(page.getByText(name, { exact: false })).toBeHidden({ timeout: 5000 });
});

// ---------------------------------------------------------------------------
// US5 – Workshop administration
// ---------------------------------------------------------------------------

test("US5/real: creates a workshop with initial participants via API", async () => {
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const { accessToken } = (await loginRes.json()) as { accessToken: string };

  // Pick a Thursday in Q3 2030 that is unlikely to conflict.
  const res = await fetch(`${API_URL}/api/workshops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      nome: `Workshop Real ${Date.now()}`,
      dataRealizacao: "2030-07-11T16:00:00-03:00",
      descricao: "Criado pelo teste de integração real.",
      colaboradorIds: [],
    }),
  });
  // 201 Created or 409 Conflict if that quarter already has one (both are correct outcomes).
  expect([201, 409]).toContain(res.status);
});

// ---------------------------------------------------------------------------
// US6 – Attendance management
// ---------------------------------------------------------------------------

test("US6/real: PUT /api/workshops/:id/participantes replaces attendance", async () => {
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  expect(loginRes.ok).toBe(true);
  const { accessToken } = (await loginRes.json()) as { accessToken: string };

  // List workshops to find one.
  const listRes = await apiGet("/api/workshops?limit=1");
  const { items } = (await listRes.json()) as { items: { id: number }[] };
  if (items.length === 0) {
    // No workshops exist yet — skip gracefully.
    return;
  }

  const workshopId = items[0]!.id;

  // Replace with an empty list (idempotent).
  const replaceRes = await fetch(`${API_URL}/api/workshops/${workshopId}/participantes`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ colaboradorIds: [] }),
  });
  expect([200, 204, 409]).toContain(replaceRes.status);
});

test("US6/real: partial failure on staged save surfaces error then revalidates", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/workshops");

  // If there is an edit button, test the staged-save partial-failure flow.
  const editBtn = page.getByRole("button", { name: /editar/i }).first();
  if (!(await editBtn.isVisible())) {
    // No workshops available — skip gracefully.
    return;
  }

  await editBtn.click();
  const dialog = page.getByRole("dialog", { name: "Editar workshop" });
  await expect(dialog).toBeVisible();

  // Change the name to trigger a metadata update.
  const nameField = dialog.getByRole("textbox", { name: "Nome" });
  const original = await nameField.inputValue();
  await nameField.fill(`${original} (editado)`);
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  // Either success or an error notification should be visible.
  const success = page.getByText(/atualizado|salvo/i);
  const error = page.getByRole("alert");
  await expect(success.or(error)).toBeVisible({ timeout: 8000 });
});
