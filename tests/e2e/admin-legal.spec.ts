import { expect, test } from "@playwright/test";
import { hydrated, login } from "./helpers";

test("modifier les CGV → /cgv mis à jour, {telephone} remplacé", async ({ page }) => {
  await login(page, "/espace-proprietaire/pages-legales/mentions-legales");
  await page
    .getByRole("navigation", { name: "Pages légales" })
    .getByRole("link", { name: "CGV" })
    .click();
  await expect(page).toHaveURL(/\/pages-legales\/cgv$/);
  const body = page.getByRole("textbox", { name: "Contenu" });
  const before = await body.inputValue();
  await body.fill(`${before}\n\n## Contact\nPour toute question : {telephone}.`);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  await page.goto("/cgv");
  await expect(page.getByRole("heading", { level: 2, name: "Contact" })).toBeVisible();
  await expect(page.getByText("Pour toute question : 06 12 34 56 78.")).toBeVisible();

  await page.goto("/espace-proprietaire/pages-legales/cgv");

  await hydrated(page);
  await page.getByRole("textbox", { name: "Contenu" }).fill(before);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
});
