/** URL publiques du site (les chemins internes /diagnostic/* ne sont jamais liés). */
export const routes = {
  home: () => "/",
  diagnostic: (id: string) => `/diagnostic-${id}-marseille`,
  city: (id: string, commune: string) => `/diagnostic-${id}/${commune}`,
  zones: () => "/zones-intervention",
  devis: (commune?: string) =>
    commune ? `/devis?commune=${encodeURIComponent(commune)}` : "/devis",
  articles: () => "/conseils",
  article: (slug: string) => `/conseils/${slug}`,
  legal: (doc: "mentions-legales" | "cgv" | "confidentialite") => `/${doc}`,
  admin: () => "/espace-proprietaire",
} as const;
