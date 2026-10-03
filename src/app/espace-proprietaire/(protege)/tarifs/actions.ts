"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAction } from "@/lib/admin/run-action";
import { BANDS } from "@/lib/domain/types";
import { adminDb } from "@/lib/firebase/admin";
import { TAGS } from "@/lib/repos/tags";
import { pricingSchema } from "@/lib/schemas/pricing";
import type { PricingInput } from "@/lib/schemas/pricing";

/** Enregistre la grille et les règles ; les pages publiques et le devis sont mis à jour. */
export async function savePricing(input: PricingInput) {
  return adminAction(
    pricingSchema,
    input,
    async (d) => {
      await adminDb()
        .doc("settings/pricing")
        .set({
          bands: [...BANDS],
          grid: d.grid,
          rules: d.rules,
          updatedAt: FieldValue.serverTimestamp(),
        });
    },
    [TAGS.pricing],
  );
}
