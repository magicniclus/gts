/**
 * Génère src/components/ui/icon-paths.ts : le tracé « duotone » de chaque icône
 * Phosphor utilisée, et seulement lui (le paquet embarque les 6 graisses par icône).
 * Usage : npm run icons:generate — ajouter le nom de l’icône à ICON_NAMES puis relancer.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const ICON_NAMES = (
  "address-book arrow-counter-clockwise arrow-left arrow-right bug building-office buildings calendar " +
  "calendar-blank calendar-check car car-profile chart-line-up check check-circle clipboard-text clock code " +
  "compass currency-eur drop envelope-simple eye fan file-arrow-down file-text fire garage gauge hammer " +
  "hourglass house house-line house-simple image info key layout lightning list magnifying-glass map-pin " +
  "map-trifold newspaper paint-roller pencil-simple phone plant plug plus question ruler scales seal-check " +
  "shield-check sign-out stairs storefront swimming-pool tag text-aa trash tray tree tree-structure " +
  "upload-simple user users warning warning-diamond x"
).split(/\s+/);

const root = resolve(import.meta.dirname, "..");
const pascal = (n: string) =>
  n
    .split("-")
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join("");

async function main() {
  const entries: string[] = [];
  for (const name of [...new Set(ICON_NAMES)].sort()) {
    const file = resolve(
      root,
      `node_modules/@phosphor-icons/react/dist/defs/${pascal(name)}.es.js`,
    );
    const mod = (await import(pathToFileURL(file).href)) as { default: Map<string, ReactElement> };
    const duotone = mod.default.get("duotone");
    if (!duotone) throw new Error(`Pas de graisse duotone pour ${name}`);
    const markup = renderToStaticMarkup(createElement("g", null, duotone)).replace(
      /^<g>|<\/g>$/g,
      "",
    );
    entries.push(`  ${JSON.stringify(name)}: ${JSON.stringify(markup)},`);
  }
  const out = `// Fichier généré par scripts/generate-icons.ts (Phosphor, graisse duotone). Ne pas modifier à la main.

export const ICON_PATHS = {
${entries.join("\n")}
} as const;

export type IconName = keyof typeof ICON_PATHS;
`;
  const path = resolve(root, "src/components/ui/icon-paths.ts");
  writeFileSync(path, out);
  execFileSync("npx", ["prettier", "--write", path], { cwd: root, stdio: "inherit" });
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
