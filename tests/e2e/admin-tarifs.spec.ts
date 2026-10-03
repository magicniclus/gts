import { expect, test } from "@playwright/test";
import { hydrated, login } from "./helpers";

test("modifier le DPE < 30 m² met à jour la page DPE et le devis", async ({ page }) => {
  await login(page, "/espace-proprietaire/tarifs");
  const cell = page.getByLabel("DPE logement, < 30 m²");
  await cell.fill("120");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
  await expect(page.getByText(/Enregistré à \d\d:\d\d/)).toBeVisible();

  await page.goto("/diagnostic-dpe-marseille");
  await expect(page.getByText("Dès 120 € TTC")).toBeVisible();
  await expect(page).toHaveTitle("Diagnostic DPE Marseille dès 120 € | GTS Diagnostic");

  await page.goto("/devis");
  await page.getByRole("button", { name: /Je mets en location/ }).click();
  await page.getByRole("button", { name: "Saisonnière / tourisme" }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("button", { name: "Appartement" }).click();
  await page.getByLabel("Commune", { exact: true }).selectOption("marseille-1er");
  await page.getByRole("button", { name: "< 30 m²" }).click();
  await expect(page.getByTestId("total")).toHaveText("120\u00a0€");

  // Remise en état pour les autres tests.
  await page.goto("/espace-proprietaire/tarifs");
  await hydrated(page);
  await page.getByRole("button", { name: "Rétablir les tarifs par défaut" }).click();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
});
