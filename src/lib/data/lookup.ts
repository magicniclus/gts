import { COMMUNES, SECTEURS } from "./communes";
import { DIAGNOSTICS } from "./diagnostics";
import type { Commune, DiagnosticContent, DiagnosticId, SecteurId } from "./types";

export type { Commune, DiagnosticContent, DiagnosticId, SecteurId } from "./types";
export { COMMUNES, DIAGNOSTICS, SECTEURS };

/** Ordre d’affichage des diagnostics (celui de la maquette). */
export const DIAGNOSTIC_IDS = Object.keys(DIAGNOSTICS) as DiagnosticId[];

/** Diagnostics déclinés en pages ville : DPE, amiante, plomb. */
export const LOCAL_DIAGNOSTIC_IDS = DIAGNOSTIC_IDS.filter((id) => DIAGNOSTICS[id].local);

export const SECTEUR_IDS = Object.keys(SECTEURS) as SecteurId[];

const bySlug = new Map<string, Commune>(COMMUNES.map((c) => [c.slug, c]));

export function isDiagnosticId(value: string): value is DiagnosticId {
  return Object.hasOwn(DIAGNOSTICS, value);
}

export function getDiagnostic(id: DiagnosticId): DiagnosticContent {
  return DIAGNOSTICS[id];
}

export function findCommune(slug: string): Commune | undefined {
  return bySlug.get(slug);
}

export function communesOfSecteur(secteur: SecteurId): Commune[] {
  return COMMUNES.filter((c) => c.secteur === secteur);
}

/** Libellé « Nom (CP) » utilisé dans les listes de communes. */
export function communeLabel(c: Commune): string {
  return `${c.name} (${c.cp})`;
}

/** Nombre de communes desservies hors Marseille, + Marseille (texte du hero). */
export const COMMUNE_COUNT = COMMUNES.filter((c) => c.secteur !== "mrs").length + 1;
