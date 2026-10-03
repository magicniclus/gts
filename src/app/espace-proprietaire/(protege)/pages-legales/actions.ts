"use server";

import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAction } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { TAGS } from "@/lib/repos/tags";
import { LEGAL_DOCS, legalPageSchema } from "@/lib/schemas/content";

export async function saveLegalPage(input: { doc: string; title: string; body: string }) {
  return adminAction(
    legalPageSchema.extend({ doc: z.enum(LEGAL_DOCS) }),
    input,
    async ({ doc, title, body }) => {
      await adminDb()
        .collection("legalPages")
        .doc(doc)
        .set({ title, body, updatedAt: FieldValue.serverTimestamp() });
    },
    (d) => [TAGS.legal(d.doc)],
  );
}
