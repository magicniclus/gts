import { z } from "zod";
import { findCommune } from "@/lib/data/lookup";
import { BANDS } from "@/lib/domain/types";
import { PHONE_PATTERN } from "./settings";

const OBLIGATION_IDS = [
  "dpe",
  "amiante",
  "plomb",
  "electricite",
  "gaz",
  "carrez",
  "termites",
  "erp",
  "audit",
  "spanc",
] as const;

export { CONSENT_TEXT, LEAD_STATUSES, type LeadStatus } from "@/lib/leads/constants";

const opt = <T extends z.ZodType>(schema: T) => schema.optional();

/** Réponses du formulaire (tout ce qui sert au calcul et au rendez-vous). */
export const devisAnswersSchema = z
  .object({
    projet: z.enum(["vente", "location", "travaux", "autre"]),
    loc: opt(z.enum(["vide", "meuble", "saisonniere"])),
    nature: opt(z.enum(["travaux", "demolition"])),
    type: z.enum(["appartement", "maison", "local", "immeuble"]),
    commune: z.string().refine((s) => findCommune(s) !== undefined, "Commune inconnue."),
    adresse: z.string().trim().max(200).default(""),
    surface: z.enum(BANDS),
    pieces: opt(z.enum(["1", "2", "3", "4", "5", "6+"])),
    copro: opt(z.enum(["oui", "non"])),
    annee: z.enum(["avant1949", "1949-1997", "1997-2012", "apres2012", "nsp"]),
    gaz: opt(z.enum(["aucun", "moins15", "plus15"])),
    elec: opt(z.enum(["moins15", "plus15", "nsp"])),
    chauffage: opt(z.enum(["elec", "gaz", "pac", "fioul", "bois", "collectif"])),
    annexes: z
      .array(z.enum(["cave", "garage", "parking", "jardin", "combles", "piscine"]))
      .max(6)
      .default([]),
    egout: opt(z.enum(["oui", "non", "nsp"])),
    classe: opt(z.enum(["ad", "efg", "aucun", "nsp"])),
    deja: z
      .array(z.enum(["dpe", "amiante", "plomb", "elec", "gaz"]))
      .max(5)
      .default([]),
    delai: z.enum(["48h", "semaine", "15j", "flexible"]),
    creneau: opt(z.enum(["matin", "apresmidi", "samedi"])),
    acces: opt(z.enum(["present", "cles", "locataire"])),
    message: z.string().trim().max(2000).default(""),
  })
  .superRefine((a, ctx) => {
    if (a.projet === "location" && !a.loc)
      ctx.addIssue({ code: "custom", path: ["loc"], message: "Type de location manquant." });
    if (a.projet === "travaux" && !a.nature)
      ctx.addIssue({ code: "custom", path: ["nature"], message: "Nature du chantier manquante." });
  });

export const contactSchema = z.object({
  profil: z.enum(["particulier", "agence", "notaire", "pro"]).default("particulier"),
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  tel: z.string().trim().regex(PHONE_PATTERN, "Numéro de téléphone invalide."),
  email: z
    .string()
    .trim()
    .max(200)
    .transform((v) => v || null)
    .pipe(z.string().email("Adresse e-mail invalide.").nullable()),
});

export const submitLeadSchema = z.object({
  answers: devisAnswersSchema,
  contact: contactSchema,
  /** Identifiants des diagnostics cochés : jamais de prix. */
  checked: z.array(z.enum(OBLIGATION_IDS)).max(10),
  consent: z.literal(true, { error: "Votre accord est nécessaire pour envoyer la demande." }),
  /** Champ piège invisible : doit rester vide. */
  website: z.string().max(0, "Demande refusée.").default(""),
  appCheckToken: z.string().max(4000).optional(),
});

export type DevisAnswers = z.infer<typeof devisAnswersSchema>;
export type SubmitLeadInput = z.input<typeof submitLeadSchema>;
export type SubmitLeadData = z.infer<typeof submitLeadSchema>;
