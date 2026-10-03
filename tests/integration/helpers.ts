import { adminDb } from "@/lib/firebase/admin";

export const db = () => adminDb();

/** Vide la base de l’émulateur pour le projet de test. */
export async function clearFirestore() {
  adminDb(); // initialise les variables d’environnement de l’émulateur
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const res = await fetch(
    `http://${host}/emulator/v1/projects/${project}/databases/(default)/documents`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) throw new Error(`clearFirestore: ${res.status}`);
}
