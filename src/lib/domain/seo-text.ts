/** Limites SEO (05-tests.md §1). */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/**
 * Renvoie le premier candidat qui tient dans la limite. Si aucun ne tient,
 * tronque le dernier au dernier mot entier et ajoute « … ».
 */
export function fitText(candidates: readonly [string, ...string[]], max: number): string {
  for (const c of candidates) if (c.length <= max) return c;
  const last = candidates[candidates.length - 1] as string;
  const cut = last.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,;:.·–-]+$/, "")}…`;
}
