import { expect, test } from "@playwright/test";
import { login, parcoursDevis } from "./helpers";

test("une demande envoyée apparaît dans l’espace propriétaire et se traite", async ({ page }) => {
  const ref = await parcoursDevis(page, "Lucie Admin");
  await login(page);
  const row = page.getByRole("listitem").filter({ hasText: ref });
  await expect(row).toContainText("Lucie Admin");
  await expect(row).toContainText("540");
  await row.getByRole("button", { name: /Lucie Admin/ }).click();
  await expect(row.getByText("Diagnostics retenus")).toBeVisible();
  await expect(row.getByRole("link", { name: /Appeler 06 21 44 87 10/ })).toHaveAttribute(
    "href",
    "tel:+33621448710",
  );

  await row.getByLabel(`Statut de ${ref}`).selectOption("rappele");
  await expect(page.getByText("Statut enregistré.")).toBeVisible();
  await row.getByLabel("Notes internes").fill("Rappeler lundi");
  await row.getByRole("button", { name: "Enregistrer les notes" }).click();
  await expect(page.getByText("Notes enregistrées.")).toBeVisible();

  await page.reload();
  const again = page.getByRole("listitem").filter({ hasText: ref });
  await expect(again.getByLabel(`Statut de ${ref}`)).toHaveValue("rappele");

  page.once("dialog", (d) => d.accept());
  await again.getByRole("button", { name: /Lucie Admin/ }).click();
  await again.getByRole("button", { name: "Supprimer" }).click();
  await expect(page.getByText("Demande supprimée.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: ref })).toHaveCount(0);
});

test("le lien de l’e-mail ouvre directement la demande", async ({ page }) => {
  const ref = await parcoursDevis(page, "Paul Lien");
  await login(page, `/espace-proprietaire/demandes?id=${ref}`);
  await expect(page).toHaveURL(new RegExp(`id=${ref}`));
  await expect(
    page.getByRole("listitem").filter({ hasText: ref }).getByText("Diagnostics retenus"),
  ).toBeVisible();
});
