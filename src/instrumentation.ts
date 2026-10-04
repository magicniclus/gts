/**
 * Au démarrage du serveur, ouvre la connexion Firestore (identifiants, jeton d’accès)
 * hors de tout rendu : les entrées « use cache » ne partagent ensuite qu’un client prêt,
 * jamais une initialisation en cours (erreur « stuck on shared state » de next dev).
 * Ne doit jamais faire échouer le démarrage : toute erreur est seulement journalisée.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { warmUpFirestore } = await import("@/lib/firebase/warm-up");
    await warmUpFirestore();
  } catch (error) {
    console.error("Démarrage : préchauffage Firestore ignoré.", error);
  }
}
