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
