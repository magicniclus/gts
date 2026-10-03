"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAction } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { TAGS } from "@/lib/repos/tags";
import { contactSchema, type ContactSettings } from "@/lib/schemas/settings";

/** Coordonnées : en-tête, pied de page, pages légales, JSON-LD et adresse de réception des demandes. */
export async function saveContact(input: ContactSettings) {
  return adminAction(
    contactSchema,
    input,
    async (c) => {
      await adminDb()
        .doc("settings/site")
        .set({ ...c, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    },
    [TAGS.settings],
  );
}
