import { expect, test } from "@playwright/test";
import { parcoursDevis } from "./helpers";

test("parcours devis : accueil → 6 étapes → confirmation avec référence", async ({ page }) => {
  await parcoursDevis(page, "Test Parcours");
});

test("parcours devis complet sur mobile @mobile", async ({ page }) => {
  await parcoursDevis(page, "Test Mobile");
});

test("page ville : le devis reprend la commune", async ({ page }) => {
  await page.goto("/diagnostic-plomb/la-ciotat");
  await page.getByRole("link", { name: /Devis Plomb à La Ciotat/ }).click();
  await page.getByRole("button", { name: /Je vends mon bien/ }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByLabel("Commune", { exact: true })).toHaveValue("la-ciotat");
});
