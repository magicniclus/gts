/** Admin SDK pour les scripts (hors Next : pas de « server-only »). */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  EMULATORS,
  PROJECT_ID,
  STORAGE_BUCKET,
  USE_EMULATORS,
} from "../../src/lib/firebase/config";

if (!getApps().length) {
  if (USE_EMULATORS) {
    // Évite la recherche (lente) du serveur de métadonnées Google Cloud.
    process.env.METADATA_SERVER_DETECTION ??= "none";
    process.env.FIRESTORE_EMULATOR_HOST ??= `${EMULATORS.firestore.host}:${EMULATORS.firestore.port}`;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= `${EMULATORS.auth.host}:${EMULATORS.auth.port}`;
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= `${EMULATORS.storage.host}:${EMULATORS.storage.port}`;
  }
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!USE_EMULATORS && !sa && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      "Identifiants manquants : ajoutez GOOGLE_APPLICATION_CREDENTIALS=<chemin du fichier JSON du compte de service> dans .env.local\n" +
        "(console Firebase → Paramètres du projet → Comptes de service → Générer une nouvelle clé privée).",
    );
    process.exit(1);
  }
  initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    ...(!USE_EMULATORS && sa ? { credential: cert(JSON.parse(sa)) } : {}),
  });
}

export const db = getFirestore();
export const auth = getAuth();
export { PROJECT_ID, USE_EMULATORS };
