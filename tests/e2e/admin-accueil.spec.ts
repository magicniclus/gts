import { expect, test } from "@playwright/test";
import { hydrated, login } from "./helpers";

test("changer le titre du hero → visible sur l’accueil", async ({ page }) => {
  await login(page, "/espace-proprietaire/accueil");
  const title = page.getByLabel("Titre", { exact: true });
  const before = await title.inputValue();
  await title.fill("Vos diagnostics, sans détour,");
  await expect(page.getByRole("region", { name: "Aperçu" })).toContainText(
    "Vos diagnostics, sans détour,",
  );
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Vos diagnostics, sans détour,",
  );

  await page.goto("/espace-proprietaire/accueil");

  await hydrated(page);
  await page.getByLabel("Titre", { exact: true }).fill(before);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
});

test("un titre vide est refusé", async ({ page }) => {
  await login(page, "/espace-proprietaire/accueil");
  await page.getByLabel("Titre", { exact: true }).fill("");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator("form").getByText("Champ obligatoire.")).toBeVisible();
});
