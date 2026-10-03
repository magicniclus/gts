import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { EMULATORS, PROJECT_ID, STORAGE_BUCKET, USE_EMULATORS } from "./config";
import { serviceAccountFromEnv } from "./credentials";

export function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (USE_EMULATORS) {
    const e = EMULATORS;
    if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.FIREBASE_EMULATOR_HUB) {
      console.warn(
        `Firebase : mode émulateurs (projet « ${PROJECT_ID} ») mais aucun émulateur lancé.\n` +
          "Pour utiliser votre vrai projet, vérifiez que .env.local (à la racine) contient " +
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID=<votre projet> et NEXT_PUBLIC_USE_EMULATORS=false, puis relancez « npx next dev ».",
      );
    }
    // Évite la recherche (lente) du serveur de métadonnées Google Cloud.
    process.env.METADATA_SERVER_DETECTION ??= "none";
    process.env.FIRESTORE_EMULATOR_HOST ??= `${e.firestore.host}:${e.firestore.port}`;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= `${e.auth.host}:${e.auth.port}`;
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= `${e.storage.host}:${e.storage.port}`;
    return initializeApp({ projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET });
  }
  const sa = serviceAccountFromEnv();
  return initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    // Netlify : compte de service dans les variables ; sinon identifiants par défaut de Google.
    ...(sa ? { credential: cert(sa) } : {}),
  });
}

/**
 * Vrai projet : Firestore en REST (HTTP/1.1) plutôt qu’en gRPC, sans canal persistant partagé
 * entre les remplissages de « use cache », et plus rapide à démarrer sur Netlify.
 * Les émulateurs restent en gRPC (le REST y réclame des identifiants Google).
 */
export function adminDb(): Firestore {
  const app = adminApp();
  try {
    return initializeFirestore(app, { preferRest: !USE_EMULATORS });
  } catch {
    // Déjà initialisé autrement (scripts) : on réutilise l’instance existante.
    return getFirestore(app);
  }
}
export const adminAuth = () => getAuth(adminApp());
export const adminStorage = () => getStorage(adminApp());
