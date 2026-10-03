import { expect, test } from "@playwright/test";

export const ADMIN = { email: "admin@gts-diagnostic.test", password: "gts-admin-2026" };

test.describe("connexion à l’espace propriétaire", () => {
  test("accès direct sans session → page de connexion", async ({ page }) => {
    await page.goto("/espace-proprietaire/tarifs");
    await expect(page).toHaveURL(
      /\/espace-proprietaire\/connexion\?next=%2Fespace-proprietaire%2Ftarifs$/,
    );
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("mauvais mot de passe → message générique", async ({ page }) => {
    await page.goto("/espace-proprietaire/connexion");
    await page.getByLabel("E-mail").fill(ADMIN.email);
    await page.getByLabel("Mot de passe").fill("mauvais");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "E-mail ou mot de passe incorrect.",
    );
    await page.getByLabel("E-mail").fill("inconnu@exemple.fr");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "E-mail ou mot de passe incorrect.",
    );
  });

  test("bon mot de passe → demandes, puis déconnexion", async ({ page }) => {
    await page.goto("/espace-proprietaire/connexion");
    await page.getByLabel("E-mail").fill(ADMIN.email);
    await page.getByLabel("Mot de passe").fill(ADMIN.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/espace-proprietaire\/demandes$/);
    await expect(page.getByRole("navigation", { name: "Espace propriétaire" })).toBeVisible();
    const cookie = (await page.context().cookies()).find((c) => c.name === "__session");
    expect(cookie?.httpOnly).toBe(true);

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/espace-proprietaire\/connexion/);
    await page.goto("/espace-proprietaire/demandes");
    await expect(page).toHaveURL(/\/espace-proprietaire\/connexion/);
  });

  test("redirection vers la page demandée après connexion", async ({ page }) => {
    await page.goto("/espace-proprietaire/coordonnees");
    await page.getByLabel("E-mail").fill(ADMIN.email);
    await page.getByLabel("Mot de passe").fill(ADMIN.password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/espace-proprietaire\/coordonnees$/);
  });

  test("cookie falsifié refusé par le layout protégé", async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: "__session", value: "faux", url: baseURL ?? "http://localhost:3100" },
    ]);
    await page.goto("/espace-proprietaire/demandes");
    await expect(page).toHaveURL(/\/espace-proprietaire\/connexion/);
  });

  test("POST /api/session refuse une autre origine", async ({ request }) => {
    const res = await request.post("/api/session", {
      data: { idToken: "x" },
      headers: { origin: "https://pirate.example" },
    });
    expect(res.status()).toBe(403);
  });
});
