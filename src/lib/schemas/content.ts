import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/domain/slug";

export const LEGAL_DOCS = ["mentions-legales", "cgv", "confidentialite"] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

export function isLegalDoc(v: string): v is LegalDoc {
  return (LEGAL_DOCS as readonly string[]).includes(v);
}

export const legalPageSchema = z.object({
  title: z.string().trim().min(1, "Champ obligatoire.").max(120),
  body: z.string().max(50_000),
});
export type LegalPage = z.infer<typeof legalPageSchema> & { updatedAt: string | null };

export const ARTICLE_CATEGORIES = [
  "DPE",
  "Amiante",
  "Plomb",
  "Réglementation",
  "Conseils vente",
  "Conseils location",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const articleSchema = z.object({
  slug: z.string().trim().regex(SLUG_PATTERN, "Adresse invalide : minuscules, chiffres et tirets."),
  title: z.string().trim().min(1, "Champ obligatoire.").max(160),
  excerpt: z.string().trim().max(400),
  body: z.string().max(100_000),
  category: z.enum(ARTICLE_CATEGORIES),
  coverUrl: z.string().url().nullable(),
  coverAlt: z.string().trim().max(200),
  published: z.boolean(),
  /** Date affichée, AAAA-MM-JJ. */
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
});
export type ArticleInput = z.infer<typeof articleSchema>;
export type Article = ArticleInput & {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
};
