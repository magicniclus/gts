"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";
import { EMULATORS, PROJECT_ID, STORAGE_BUCKET, USE_EMULATORS } from "./config";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app",
};

let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

function app() {
  return getApps().length ? getApp() : initializeApp(config);
}

/** Auth navigateur (connexion de l’administrateur uniquement). */
export function clientAuth(): Auth {
  if (!auth) {
    auth = getAuth(app());
    if (USE_EMULATORS) {
      connectAuthEmulator(auth, `http://${EMULATORS.auth.host}:${EMULATORS.auth.port}`, {
        disableWarnings: true,
      });
    }
  }
  return auth;
}

/** Storage navigateur (envoi des images par l’administrateur). */
export function clientStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(app());
    if (USE_EMULATORS)
      connectStorageEmulator(storage, EMULATORS.storage.host, EMULATORS.storage.port);
  }
  return storage;
}
