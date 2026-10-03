import "server-only";
import { adminDb } from "@/lib/firebase/admin";

const col = () => adminDb().collection("leads");

/** Nombre de demandes au statut « nouveau » (badge de la barre latérale). */
export async function countNewLeads(): Promise<number> {
  const snap = await col().where("status", "==", "nouveau").count().get();
  return snap.data().count;
}
