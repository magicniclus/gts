import { expect, type Page } from "@playwright/test";

export const ADMIN = { email: "admin@gts-diagnostic.test", password: "gts-admin-2026" };

/** Accueil → carte du hero → 6 étapes → confirmation ; renvoie la référence. */
export async function parcoursDevis(page: Page, nom: string) {
  await page.goto("/");
  const carte = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Devis gratuit en 2 min" }) });
  await carte.getByRole("button", { name: "Je vends" }).click();
  await carte.getByRole("button", { name: "Appartement" }).click();
  await carte.getByLabel("Commune du bien").selectOption("marseille-8e");
  await carte.getByRole("button", { name: /Voir mes diagnostics obligatoires/ }).click();

  await expect(page).toHaveURL(/\/devis$/);
  await expect(page.getByRole("heading", { name: "Parlez-nous du bien" })).toBeVisible();
  await expect(page.getByLabel("Commune", { exact: true })).toHaveValue("marseille-8e");
  await page.getByRole("button", { name: "30 – 60 m²" }).click();
  await page
    .getByRole("group", { name: "En copropriété ?" })
    .getByRole("button", { name: "Oui" })
    .click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByRole("button", { name: /Avant 1949/ }).click();
  await page
    .getByRole("group", { name: "Installation gaz" })
    .getByRole("button", { name: "Plus de 15 ans" })
    .click();
  await page
    .getByRole("group", { name: "Installation électrique" })
    .getByRole("button", { name: "Plus de 15 ans" })
    .click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(page.getByRole("heading", { name: "Vos diagnostics" })).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("540 €");
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByRole("button", { name: /Cette semaine/ }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await page.getByLabel("Nom et prénom").fill(nom);
  await page.getByLabel("Téléphone").fill("06 21 44 87 10");
  await page.getByLabel("E-mail").fill("e2e@exemple.fr");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();

  await expect(page.getByRole("heading", { name: /c’est envoyé/ })).toBeVisible();
  const ref = (await page.getByTestId("lead-ref").textContent()) ?? "";
  expect(ref).toMatch(/^L-\d{4}$/);
  return ref;
}

export async function login(page: Page, path = "/espace-proprietaire/demandes") {
  await page.goto(path);
  await page.getByLabel("E-mail").fill(ADMIN.email);
  await page.getByLabel("Mot de passe").fill(ADMIN.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation", { name: "Espace propriétaire" })).toBeVisible();
}
