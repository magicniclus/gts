import { expect, test } from "@playwright/test";

test.describe("pages publiques", () => {
  test("accueil : hero éditable, diagnostics et zones", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Vos diagnostics immobiliers",
    );
    await expect(page.getByText("à Marseille et dans 69 communes")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Diagnostic de performance énergétique/ }).first(),
    ).toHaveAttribute("href", "/diagnostic-dpe-marseille");
    await page.getByRole("searchbox", { name: "Rechercher une commune" }).fill("13600");
    await expect(page.getByRole("link", { name: "DPE à La Ciotat" })).toBeVisible();
  });

  test("page diagnostic servie par rewrite, avec canonical et JSON-LD", async ({ page }) => {
    await page.goto("/diagnostic-dpe-marseille");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diagnostic DPE à Marseille");
    await expect(page).toHaveTitle("Diagnostic DPE Marseille dès 100 € | GTS Diagnostic");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/diagnostic-dpe-marseille$/,
    );
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}")["@type"]));
    expect(types).toEqual(
      expect.arrayContaining(["ProfessionalService", "Service", "FAQPage", "BreadcrumbList"]),
    );
    await expect(page.getByRole("link", { name: "DPE Aubagne" }).first()).toHaveAttribute(
      "href",
      "/diagnostic-dpe/aubagne",
    );
  });

  test("page ville et liens connexes", async ({ page }) => {
    await page.goto("/diagnostic-amiante/aubagne");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Diagnostic Amiante à Aubagne (13400)",
    );
    await expect(page.getByRole("link", { name: "Diagnostic Plomb à Aubagne" })).toHaveAttribute(
      "href",
      "/diagnostic-plomb/aubagne",
    );
    await expect(
      page.getByRole("navigation", { name: "Communes voisines" }).getByRole("link"),
    ).toHaveCount(8);
  });

  test("chemins internes redirigés, URL inconnues en 404", async ({ page, request }) => {
    await page.goto("/diagnostic/plomb/cassis");
    await expect(page).toHaveURL(/\/diagnostic-plomb\/cassis$/);
    expect((await request.get("/diagnostic-gaz/aubagne")).status()).toBe(404);
    expect((await request.get("/diagnostic-dpe/paris")).status()).toBe(404);
  });

  test("articles publiés", async ({ page }) => {
    await page.goto("/conseils");
    await page.getByRole("link", { name: /DPE 2026/ }).click();
    await expect(page).toHaveURL(/\/conseils\/dpe-2026-ce-qui-change$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DPE 2026");
    await expect(page.getByRole("heading", { name: "À lire aussi" })).toBeVisible();
  });

  test("pages légales : variables remplacées", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mentions légales");
    await expect(page.getByText(/Téléphone : 06 12 34 56 78/)).toBeVisible();
    await expect(page.getByText("SIRET : [à compléter]", { exact: false })).toBeVisible();
  });

  test("sitemap et robots", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml.match(/<url>/g)?.length).toBe(1 + 1 + 1 + 1 + 9 + 252 + 3 + 3);
    expect(await (await request.get("/robots.txt")).text()).toContain(
      "Disallow: /espace-proprietaire",
    );
  });
});
