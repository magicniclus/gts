import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_PRICING } from "@/lib/defaults";
import { adminDb } from "@/lib/firebase/admin";
import { BANDS } from "@/lib/domain/types";
import { pricingSchema, type PricingSettings } from "@/lib/schemas/pricing";
import { toIso } from "./convert";
import { TAGS } from "./tags";

/** Valide settings/pricing ; un document absent ou invalide retombe sur le barème par défaut. */
export function parsePricing(data: Record<string, unknown> | undefined): PricingSettings {
  if (!data) return DEFAULT_PRICING;
  const parsed = pricingSchema.safeParse({
    grid: { ...DEFAULT_PRICING.grid, ...(data.grid as object | undefined) },
    rules: { ...DEFAULT_PRICING.rules, ...(data.rules as object | undefined) },
  });
  if (!parsed.success) {
    console.error("settings/pricing invalide, barème par défaut utilisé", parsed.error.issues);
    return DEFAULT_PRICING;
  }
  return { bands: BANDS, ...parsed.data, updatedAt: toIso(data.updatedAt) };
}

export async function readPricing(): Promise<PricingSettings> {
  const snap = await adminDb().doc("settings/pricing").get();
  return parsePricing(snap.data());
}

export async function getPricing(): Promise<PricingSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.pricing);
  return readPricing();
}
