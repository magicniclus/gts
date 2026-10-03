/** Configuration partagée client / serveur. En développement : émulateurs, projet « demo-gts ». */
export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-gts";

/** Émulateurs si demandé explicitement, ou par défaut pour un projet « demo-* » (tests, développement). */
export const USE_EMULATORS =
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true" ||
  (PROJECT_ID.startsWith("demo-") && process.env.NEXT_PUBLIC_USE_EMULATORS !== "false");

export const EMULATORS = {
  firestore: { host: "127.0.0.1", port: 8080 },
  auth: { host: "127.0.0.1", port: 9099 },
  storage: { host: "127.0.0.1", port: 9199 },
} as const;

export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`;
