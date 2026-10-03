import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("brouillon absent du site, puis publié : liste, sitemap et page", async ({
  page,
  request,
}) => {
  await login(page, "/espace-proprietaire/articles");
  await page.getByRole("button", { name: "Nouvel article" }).click();
  await expect(page.getByRole("heading", { name: "Modifier l’article" })).toBeVisible();

  await page
    .getByRole("textbox", { name: "Titre" })
    .fill("Diagnostic gaz : les points de contrôle");
  await expect(page.getByRole("textbox", { name: "Adresse de la page" })).toHaveValue(
    "diagnostic-gaz-les-points-de-controle",
  );
  await page
    .getByRole("textbox", { name: "Résumé" })
    .fill("Ce que vérifie le diagnostiqueur sur une installation gaz.");
  await page
    .getByRole("textbox", { name: "Contenu" })
    .fill("## Tuyauteries\nÉtat et étanchéité.\n\n## Ventilation\nAmenées d’air.");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  await page.goto("/conseils");
  await expect(page.getByRole("link", { name: /Diagnostic gaz : les points de contrôle/ })).toHaveCount(0);
  expect((await request.get("/conseils/diagnostic-gaz-les-points-de-controle")).status()).toBe(404);

  await page.goto("/espace-proprietaire/articles");
  await page
    .getByRole("link", { name: "Modifier « Diagnostic gaz : les points de contrôle »" })
    .click();
  await page.getByRole("checkbox", { name: "Publié sur le site" }).check();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  await page.goto("/conseils");
  await page.getByRole("link", { name: /Diagnostic gaz : les points de contrôle/ }).click();
  await expect(page).toHaveURL(/\/conseils\/diagnostic-gaz-les-points-de-controle$/);
  await expect(page.getByRole("heading", { level: 2, name: "Ventilation" })).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/conseils/diagnostic-gaz-les-points-de-controle");

  await page.goto("/espace-proprietaire/articles");
  await page
    .getByRole("link", { name: "Modifier « Diagnostic gaz : les points de contrôle »" })
    .click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Supprimer l’article" }).click();
  await expect(page).toHaveURL(/\/espace-proprietaire\/articles$/);
  await expect(page.getByRole("link", { name: "Modifier « Diagnostic gaz : les points de contrôle »" })).toHaveCount(0);
});

test("adresse déjà utilisée refusée", async ({ page }) => {
  await login(page, "/espace-proprietaire/articles");
  await page.getByRole("button", { name: "Nouvel article" }).click();
  await page.getByRole("textbox", { name: "Adresse de la page" }).fill("dpe-2026-ce-qui-change");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(
    page.getByText("Cette adresse est déjà utilisée par un autre article."),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Supprimer l’article" }).click();
  await expect(page).toHaveURL(/\/espace-proprietaire\/articles$/);
});
