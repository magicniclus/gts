import { adminDb } from "./admin";

const WARM_UP_TIMEOUT_MS = 5000;

/** Première lecture Firestore, bornée dans le temps ; un échec ne bloque pas le démarrage. */
export async function warmUpFirestore(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, WARM_UP_TIMEOUT_MS);
  });
  const read = adminDb()
    .doc("settings/site")
    .get()
    .then(
      () => undefined,
      (error: unknown) => {
        console.warn("Firebase : connexion à Firestore impossible au démarrage.", error);
      },
    );
  try {
    await Promise.race([read, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
