import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { EMULATORS, PROJECT_ID, STORAGE_BUCKET, USE_EMULATORS } from "./config";

export function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (USE_EMULATORS) {
    const e = EMULATORS;
    // Évite la recherche (lente) du serveur de métadonnées Google Cloud.
    process.env.METADATA_SERVER_DETECTION ??= "none";
    process.env.FIRESTORE_EMULATOR_HOST ??= `${e.firestore.host}:${e.firestore.port}`;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= `${e.auth.host}:${e.auth.port}`;
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= `${e.storage.host}:${e.storage.port}`;
    return initializeApp({ projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET });
  }
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  return initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    // Sur App Hosting, les identifiants par défaut suffisent ; ailleurs, compte de service JSON.
    ...(sa ? { credential: cert(JSON.parse(sa)) } : {}),
  });
}

export const adminDb = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());
export const adminStorage = () => getStorage(adminApp());
