"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAction } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { TAGS } from "@/lib/repos/tags";
import { heroSchema, type HeroSettings } from "@/lib/schemas/settings";

export async function saveHero(input: HeroSettings) {
  return adminAction(
    heroSchema,
    input,
    async (hero) => {
      await adminDb()
        .doc("settings/site")
        .set({ hero, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    },
    [TAGS.settings],
  );
}
