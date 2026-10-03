import { z } from "zod";
import { BANDS, PRICE_KEYS, type PriceGrid, type PricingRules } from "@/lib/domain/types";

const euros = z
  .number()
  .int("Nombre entier attendu.")
  .min(0, "Le prix ne peut pas être négatif.")
  .max(100_000);
const row = z.tuple([euros, euros, euros, euros, euros]);

export const gridSchema = z.object(
  Object.fromEntries(PRICE_KEYS.map((k) => [k, row])) as Record<
    (typeof PRICE_KEYS)[number],
    typeof row
  >,
);

export const rulesSchema = z.object({
  maison: z.number().int().min(0).max(100),
  annexe: euros,
  packPct: z.number().int().min(0).max(100),
  packMin: z.number().int().min(1).max(20),
  d30: euros,
  d40: euros,
});

export const pricingSchema = z.object({ grid: gridSchema, rules: rulesSchema });

export type PricingSettings = {
  bands: typeof BANDS;
  grid: PriceGrid;
  rules: PricingRules;
  updatedAt: string | null;
};

export type PricingInput = z.infer<typeof pricingSchema>;

export const PRICE_ROW_LABELS: Record<(typeof PRICE_KEYS)[number], string> = {
  dpe: "DPE logement",
  dpet: "DPE tertiaire",
  amiante: "Amiante (vente / DAPP)",
  raat: "Amiante avant travaux",
  plomb: "Plomb (CREP)",
  electricite: "Électricité",
  gaz: "Gaz",
  carrez: "Carrez / Boutin",
  termites: "Termites",
  audit: "Audit énergétique",
};

export const BAND_LABELS = [
  "< 30 m²",
  "30 – 60 m²",
  "60 – 100 m²",
  "100 – 150 m²",
  "> 150 m²",
] as const;

export const RULE_FIELDS = [
  { key: "maison", label: "Majoration maison", unit: "%" },
  { key: "annexe", label: "Supplément par annexe", unit: "€" },
  { key: "packPct", label: "Remise pack", unit: "%" },
  { key: "packMin", label: "Remise à partir de", unit: "diagnostics" },
  { key: "d30", label: "Déplacement 30 – 40 km", unit: "€" },
  { key: "d40", label: "Déplacement au-delà de 40 km", unit: "€" },
] as const;

/** Copie modifiable du barème pour un formulaire. */
export function toPricingInput(p: { grid: PriceGrid; rules: PricingRules }): PricingInput {
  const grid = Object.fromEntries(
    PRICE_KEYS.map((k) => [k, [...p.grid[k]]]),
  ) as PricingInput["grid"];
  return { grid, rules: { ...p.rules } };
}
