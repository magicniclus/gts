/**
 * Transforme un libellé en identifiant d’URL : minuscules, sans accents,
 * tout caractère non alphanumérique remplacé par un tiret.
 * « Berre-l’Étang » → « berre-l-etang », « cœur » → « coeur ».
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
