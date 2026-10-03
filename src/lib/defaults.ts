/**
 * Valeurs par défaut (docs/handoff/data/settings-defaults.json), converties au
 * format Firestore de 02-firebase.md : hero.t1 → title, hero.t2 → highlight,
 * pr → grid, legal.mentions → legalPages/mentions-legales…
 * Servent au seed et de repli tant qu’un document n’existe pas.
 */
import raw from "../../docs/handoff/data/settings-defaults.json";
import { BANDS, type PriceGrid } from "@/lib/domain/types";
import type { ArticleCategory, LegalDoc, LegalPage } from "@/lib/schemas/content";
import type { PricingSettings } from "@/lib/schemas/pricing";
import type { SiteSettings } from "@/lib/schemas/settings";

export const DEFAULT_SITE: SiteSettings = {
  phone: raw.phone,
  email: raw.email,
  hours: raw.hours,
  adresse: raw.adresse,
  siret: raw.siret,
  certification: raw.certification,
  assurance: raw.assurance,
  hero: {
    kicker: raw.hero.kicker,
    title: raw.hero.t1,
    highlight: raw.hero.t2,
    intro: raw.hero.intro,
  },
  photos: {
    portraitUrl: raw.photos.portrait || null,
    portraitAlt: raw.photos.portraitAlt,
    logoLightUrl: raw.photos.logoNavy || null,
    logoDarkUrl: raw.photos.logoWhite || null,
  },
  updatedAt: null,
};

export const DEFAULT_PRICING: PricingSettings = {
  bands: BANDS,
  grid: raw.pr as unknown as PriceGrid,
  rules: raw.rules,
  updatedAt: null,
};

const LEGAL_KEYS: Record<LegalDoc, keyof typeof raw.legal> = {
  "mentions-legales": "mentions",
  cgv: "cgv",
  confidentialite: "confidentialite",
};

export function defaultLegalPage(doc: LegalDoc): LegalPage {
  const page = raw.legal[LEGAL_KEYS[doc]];
  return { title: page.title, body: page.body, updatedAt: null };
}

export type DefaultArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ArticleCategory;
  published: boolean;
  publishedAt: string;
};

export const DEFAULT_ARTICLES: DefaultArticle[] = raw.articles.map((a) => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  body: a.body,
  category: a.cat as ArticleCategory,
  published: a.published,
  publishedAt: a.date,
}));
