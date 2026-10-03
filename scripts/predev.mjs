/**
 * Prépare « npm run dev » sur un clone neuf (Windows, macOS, Linux) :
 * installe les dépendances de functions/ et crée le dossier d’import des émulateurs.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

if (!existsSync("functions/node_modules")) {
  console.log("Installation des dépendances de functions/…");
  execSync("npm install --prefix functions", { stdio: "inherit" });
}

// Les émulateurs refusent un dossier d’import sans métadonnées : on en crée un vide valide.
if (!existsSync(".emulator-data/firebase-export-metadata.json")) {
  mkdirSync(".emulator-data", { recursive: true });
  writeFileSync(
    ".emulator-data/firebase-export-metadata.json",
    JSON.stringify({ version: "15.0.0" }),
  );
}
