/** Tags de cache des lectures Firestore (invalidés par updateTag dans les Server Actions). */
export const TAGS = {
  settings: "settings",
  pricing: "pricing",
  articles: "articles",
  legal: (doc: string) => `legal:${doc}`,
} as const;
