"use server";

import { z } from "zod";
import { adminAction, UserError } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { LEAD_STATUSES } from "@/lib/schemas/lead";

// Les demandes ne sont lues par aucune page publique : aucun tag de cache à invalider.
const id = z.string().regex(/^[A-Za-z0-9-]{1,40}$/);

async function update(leadId: string, data: Record<string, unknown>) {
  const ref = adminDb().collection("leads").doc(leadId);
  if (!(await ref.get()).exists) throw new UserError("Demande introuvable.");
  await ref.update(data);
}

export async function updateLeadStatus(input: { id: string; status: string }) {
  return adminAction(
    z.object({ id, status: z.enum(LEAD_STATUSES) }),
    input,
    (d) => update(d.id, { status: d.status }),
    [],
  );
}

export async function updateLeadNotes(input: { id: string; notes: string }) {
  return adminAction(
    z.object({ id, notes: z.string().max(5000) }),
    input,
    (d) => update(d.id, { notes: d.notes }),
    [],
  );
}

export async function deleteLead(input: { id: string }) {
  return adminAction(
    z.object({ id }),
    input,
    async (d) => {
      await adminDb().collection("leads").doc(d.id).delete();
    },
    [],
  );
}
