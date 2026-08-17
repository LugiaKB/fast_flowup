import { expect, test, type Page } from "@playwright/test";

async function loginAsAdministrator(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Nome de usuário" }).fill("gestor");
  await page.getByLabel("Senha").fill("senha-de-teste");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/workshops$/);
}

async function navigateTo(page: Page, label: "Colaboradores" | "Workshops") {
  const desktopLink = page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", {
    name: label,
  });
  if (await desktopLink.isVisible()) {
    await desktopLink.click();
    return;
  }

  await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await page.getByRole("menuitem", { name: label }).click();
}

test("US1: lists and searches public collaborators", async ({ page }) => {
  await page.goto("/colaboradores");

  await expect(page.getByRole("heading", { name: "Colaboradores", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ana Beatriz" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar colaboradores" }).fill("Helena");
  await expect(page.getByRole("heading", { name: "Helena Martins" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ana Beatriz" })).toBeHidden();
});

test("US2: browses workshops and their participants", async ({ page }) => {
  await page.goto("/workshops");

  await expect(page.getByRole("heading", { name: "Comunicação que conecta" })).toBeVisible();
  await page.getByRole("link", { name: "Ver detalhes de Comunicação que conecta" }).click();

  await expect(page).toHaveURL(/\/workshops\/1$/);
  await expect(page.getByRole("heading", { name: "Participantes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ana Beatriz" })).toBeVisible();
});

test("theme: follows the system preference and persists the manual choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/workshops");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Ativar tema escuro" })).toBeVisible();
});

test("US3 and US4: authenticates and manages collaborators", async ({ page }) => {
  await loginAsAdministrator(page);
  await navigateTo(page, "Colaboradores");

  await page.getByRole("button", { name: "Novo colaborador" }).click();
  const dialog = page.getByRole("dialog", { name: "Novo colaborador" });
  await dialog.getByRole("textbox", { name: "Nome" }).fill("Marina Albuquerque");
  await dialog.getByRole("button", { name: "Salvar colaborador" }).click();

  await page.getByRole("searchbox", { name: "Buscar colaboradores" }).fill("Marina Albuquerque");
  await expect(page.getByRole("heading", { name: "Marina Albuquerque" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar Marina Albuquerque" })).toBeVisible();
});

test("US5: creates a contract-valid workshop", async ({ page }) => {
  await loginAsAdministrator(page);

  await page.getByRole("button", { name: "Novo workshop" }).click();
  const dialog = page.getByRole("dialog", { name: "Novo workshop" });
  await dialog.getByRole("textbox", { name: "Nome" }).fill("Comunicação inclusiva");
  await dialog.getByLabel("Data de realização").fill("2026-10-15");
  await dialog
    .getByLabel("Descrição")
    .fill("Práticas para tornar conversas e decisões mais inclusivas.");
  const participantSearch = dialog.getByRole("searchbox", { name: "Buscar participantes" });
  await participantSearch.fill("Helena");
  await dialog.getByRole("checkbox", { name: "Helena Martins" }).check();
  await participantSearch.fill("Larissa");
  await dialog.getByRole("checkbox", { name: "Larissa Gomes" }).check();
  await expect(dialog.getByText("2 participantes selecionados")).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar workshop" }).click();

  const createdCard = page.getByRole("heading", { name: "Comunicação inclusiva" }).locator("..", {
    hasText: "2 participantes",
  });
  await expect(createdCard).toBeVisible();
  await page.getByRole("link", { name: "Ver detalhes de Comunicação inclusiva" }).click();
  await expect(page.getByRole("heading", { name: "Helena Martins" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Larissa Gomes" })).toBeVisible();
});

test("US6: searches and updates workshop attendance without closing the panel", async ({ page }) => {
  await loginAsAdministrator(page);
  await page.getByRole("link", { name: "Ver detalhes de Comunicação que conecta" }).click();

  await page.getByRole("button", { name: "Gerenciar participantes" }).click();
  const dialog = page.getByRole("dialog", { name: "Gerenciar participantes" });
  const search = dialog.getByRole("searchbox", { name: "Buscar colaboradores" });
  await search.fill("Helena");
  await expect(dialog.getByRole("checkbox", { name: "Helena Martins" })).toBeVisible();
  await dialog.getByRole("checkbox", { name: "Helena Martins" }).check();
  await search.clear();
  await dialog.getByRole("checkbox", { name: "Ana Beatriz" }).uncheck();
  await dialog.getByRole("button", { name: "Salvar participantes" }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Remover Helena Martins" })).toBeVisible();
  await search.fill("Larissa");
  await dialog.getByLabel("Colaborador para adicionar").selectOption("7");
  await dialog.getByRole("button", { name: "Adicionar participante" }).click();
  await expect(dialog.getByRole("button", { name: "Remover Larissa Gomes" })).toBeVisible();

  await dialog.getByRole("button", { name: "Fechar painel" }).click();
  await expect(page.getByRole("heading", { name: "Ana Beatriz" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Helena Martins" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Larissa Gomes" })).toBeVisible();
});
