import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const heroSchema = z.object({
  kicker: text(120).min(1, "Champ obligatoire."),
  title: text(160).min(1, "Champ obligatoire."),
  highlight: text(160),
  intro: text(600).min(1, "Champ obligatoire."),
});

export const photosSchema = z.object({
  portraitUrl: z.string().url().nullable(),
  portraitAlt: text(200),
  logoLightUrl: z.string().url().nullable(),
  logoDarkUrl: z.string().url().nullable(),
});

/** Téléphone français : 10 chiffres (espaces, points, tirets tolérés) ou +33. */
export const PHONE_PATTERN = /^(?:\+33\s?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}$/;

export const contactSchema = z.object({
  phone: z.string().trim().regex(PHONE_PATTERN, "Numéro de téléphone invalide."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  hours: text(80).min(1, "Champ obligatoire."),
  adresse: text(200),
  siret: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\d{14}$/.test(v.replace(/\s/g, "")),
      "Le SIRET compte 14 chiffres.",
    ),
  certification: text(300),
  assurance: text(300),
});

export const siteSettingsSchema = contactSchema.extend({
  hero: heroSchema,
  photos: photosSchema,
});

export type HeroSettings = z.infer<typeof heroSchema>;
export type PhotoSettings = z.infer<typeof photosSchema>;
export type ContactSettings = z.infer<typeof contactSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema> & { updatedAt: string | null };
