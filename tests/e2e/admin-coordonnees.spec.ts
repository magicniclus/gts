import { expect, test } from "@playwright/test";
import { hydrated, login } from "./helpers";

test("coordonnées : en-tête, pied de page et mentions légales mis à jour", async ({ page }) => {
  await login(page, "/espace-proprietaire/coordonnees");
  await page.getByLabel("Téléphone").fill("07 11 22 33 44");
  await page.getByLabel("SIRET").fill("123 456 789 00012");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: /Appel direct 07 11 22 33 44/ })).toHaveAttribute(
    "href",
    "tel:+33711223344",
  );
  await expect(page.getByText("SIRET 123 456 789 00012")).toBeVisible();
  await page.goto("/mentions-legales");
  await expect(page.getByText(/Téléphone : 07 11 22 33 44/)).toBeVisible();

  await page.goto("/espace-proprietaire/coordonnees");

  await hydrated(page);
  await page.getByLabel("Téléphone").fill("06 12 34 56 78");
  await page.getByLabel("SIRET").fill("");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
});

test("un e-mail invalide est refusé", async ({ page }) => {
  await login(page, "/espace-proprietaire/coordonnees");
  await page.getByRole("textbox", { name: "E-mail" }).fill("pas-un-mail");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator("form").getByText("Adresse e-mail invalide.")).toBeVisible();
});
