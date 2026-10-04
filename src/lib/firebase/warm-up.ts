import { adminDb } from "./admin";

const WARM_UP_TIMEOUT_MS = 5000;

/**
 * Première lecture Firestore, bornée dans le temps. Ne lève jamais : un échec (identifiants
 * invalides, réseau) est seulement journalisé et ne doit pas empêcher le serveur de démarrer.
 */
export async function warmUpFirestore(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, WARM_UP_TIMEOUT_MS);
  });
  try {
    const read = adminDb()
      .doc("settings/site")
      .get()
      .then(
        () => undefined,
        (error: unknown) => {
          console.error("Firebase : lecture Firestore impossible au démarrage.", error);
        },
      );
    await Promise.race([read, timeout]);
  } catch (error) {
    console.error("Firebase : initialisation impossible (vérifier les identifiants).", error);
  } finally {
    clearTimeout(timer);
  }
}
