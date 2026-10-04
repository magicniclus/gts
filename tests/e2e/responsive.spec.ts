import { expect, test } from "@playwright/test";
import { jusquauxCoordonnees, login } from "./helpers";

const PAGES = [
  "/",
  "/diagnostic-dpe-marseille",
  "/diagnostic-amiante/chateauneuf-les-martigues",
  "/zones-intervention",
  "/devis",
  "/conseils",
  "/conseils/vendre-appartement-avant-1949-marseille",
  "/mentions-legales",
  "/espace-proprietaire/connexion",
];

for (const width of [360, 768, 1280]) {
  test(`aucun défilement horizontal à ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${path} déborde de ${overflow} px`).toBeLessThanOrEqual(0);
    }
  });
}

for (const width of [320, 360]) {
  test(`devis à ${width} px : boutons de la dernière étape dans l’écran`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await jusquauxCoordonnees(page);
    const envoyer = page.getByRole("button", { name: "Envoyer ma demande" });
    const retour = page.getByRole("button", { name: "Retour" });
    for (const bouton of [envoyer, retour]) {
      const box = await bouton.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("espace propriétaire sur mobile : menu tiroir", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page, "/espace-proprietaire/tarifs");
  const nav = page.getByRole("navigation", { name: "Espace propriétaire" });
  await expect(nav).toBeHidden();
  await page.getByRole("button", { name: "Menu" }).click();
  await nav.getByRole("link", { name: "Articles" }).click();
  await expect(page).toHaveURL(/\/articles$/);
  await expect(nav).toBeHidden();
  for (const path of [
    "/espace-proprietaire/demandes",
    "/espace-proprietaire/tarifs",
    "/espace-proprietaire/accueil",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
