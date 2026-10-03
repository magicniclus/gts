/**
 * Génère src/lib/data/communes.ts et diagnostics.ts à partir de
 * docs/handoff/data/*.json. Usage : npm run data:generate
 * Le test tests/unit/data.test.ts vérifie que les fichiers générés sont à jour.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const read = (p: string): unknown => JSON.parse(readFileSync(resolve(root, p), "utf8"));

type RawCommune = {
  name: string;
  cp: string;
  km: number;
  secteur: string;
  bati: string;
  slug: string;
  peb: boolean;
};
type RawDiag = Record<string, unknown> & { icon: string; local?: boolean };

const rawCommunes = read("docs/handoff/data/communes.json") as {
  secteurs: Record<string, string>;
  communes: RawCommune[];
};
const rawDiags = read("docs/handoff/data/diagnostics.json") as Record<string, RawDiag>;

const header =
  "// Fichier généré par scripts/generate-data.ts depuis docs/handoff/data. Ne pas modifier à la main.\n";

const communes = `${header}
import type { Commune, SecteurId } from "./types";

export const SECTEURS = ${JSON.stringify(rawCommunes.secteurs, null, 2)} as const satisfies Record<SecteurId, string>;

export const COMMUNES = ${JSON.stringify(rawCommunes.communes, null, 2)} as const satisfies readonly Commune[];
`;

const diags = Object.fromEntries(
  Object.entries(rawDiags).map(([id, d]) => [
    id,
    { ...d, icon: d.icon.replace(/^ph-/, ""), local: d.local === true },
  ]),
);

const diagnostics = `${header}
import type { DiagnosticContent, DiagnosticId } from "./types";

export const DIAGNOSTICS = ${JSON.stringify(diags, null, 2)} as const satisfies Record<DiagnosticId, DiagnosticContent>;
`;

const out = {
  "src/lib/data/communes.ts": communes,
  "src/lib/data/diagnostics.ts": diagnostics,
};
for (const [path, content] of Object.entries(out)) writeFileSync(resolve(root, path), content);
execFileSync("npx", ["prettier", "--write", ...Object.keys(out)], {
  cwd: root,
  stdio: "inherit",
});
