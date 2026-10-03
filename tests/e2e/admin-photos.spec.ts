import { expect, test } from "@playwright/test";
import { hydrated, login } from "./helpers";

test("envoyer un portrait → affiché dans « Qui suis-je »", async ({ page }) => {
  await login(page, "/espace-proprietaire/photos");
  const card = page.getByRole("region", { name: "Portrait de Guillaume" });
  await card.getByLabel("Remplacer").setInputFiles("public/logo-navy.png");
  await expect(page.getByText("Image enregistrée.")).toBeVisible();
  await expect(card.getByRole("img")).toHaveAttribute("src", /portrait\.jpg/);

  await page.goto("/");
  const portrait = page.locator("#guillaume img");
  await expect(portrait).toHaveAttribute(
    "alt",
    "Guillaume Tilliet, diagnostiqueur immobilier à Marseille",
  );
  await expect(portrait).toHaveJSProperty("complete", true);
  expect(await portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  await page.goto("/espace-proprietaire/photos");

  await hydrated(page);
  await page
    .getByRole("region", { name: "Portrait de Guillaume" })
    .getByRole("button", { name: "Retirer" })
    .click();
  await expect(page.getByText("Photo retirée.")).toBeVisible();
});

test("un fichier non image est refusé", async ({ page }) => {
  await login(page, "/espace-proprietaire/photos");
  const card = page.getByRole("region", { name: "Logo, fond clair" });
  await card
    .getByLabel("Remplacer")
    .setInputFiles({ name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
  await expect(card.getByRole("alert")).toHaveText("Ce fichier n’est pas une image.");
});
