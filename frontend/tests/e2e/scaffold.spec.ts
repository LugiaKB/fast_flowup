import { expect, test } from "@playwright/test";

test("renders the application scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/workshops$/);
  await expect(page.getByRole("heading", { name: "Workshops" })).toBeVisible();
});
