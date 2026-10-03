/**
 * « Markdown » minimal des articles et pages légales :
 * « ## » en début de bloc = intertitre, ligne vide = nouveau paragraphe.
 * Les retours à la ligne simples restent dans le paragraphe (affichés en pre-line).
 */
export type RichBlock =
  { readonly type: "h"; readonly text: string } | { readonly type: "p"; readonly text: string };

export function parseMarkdownLite(source: string): RichBlock[] {
  return source
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap((b): RichBlock[] => {
      if (!b.startsWith("## ")) return [{ type: "p", text: b }];
      const i = b.indexOf("\n");
      const head: RichBlock = {
        type: "h",
        text: (i < 0 ? b : b.slice(0, i)).slice(3).trim(),
      };
      return i < 0 ? [head] : [head, { type: "p", text: b.slice(i + 1).trim() }];
    });
}

export const PLACEHOLDER_FALLBACK = "[à compléter]";

/**
 * Remplace les {clés} connues par leur valeur. Une valeur vide devient
 * « [à compléter] » ; une clé inconnue est laissée telle quelle.
 */
export function fillPlaceholders(
  text: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return text.replace(/\{([a-z]+)\}/g, (match, key: string) => {
    if (!Object.hasOwn(values, key)) return match;
    const v = String(values[key]).trim();
    return v === "" ? PLACEHOLDER_FALLBACK : v;
  });
}

/** Résumé en texte brut (premiers caractères, sans intertitres). */
export function plainText(source: string): string {
  return parseMarkdownLite(source)
    .map((b) => b.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
