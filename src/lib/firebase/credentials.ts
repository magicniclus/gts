/**
 * Identifiants du compte de service Firebase, lus dans l’environnement (sans « server-only » :
 * partagé avec les scripts). Trois formes acceptées, de la plus compacte à la plus simple :
 * - FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (recommandé sur Netlify : variables limitées à 4 Ko) ;
 * - FIREBASE_SERVICE_ACCOUNT : contenu complet du fichier JSON ;
 * - GOOGLE_APPLICATION_CREDENTIALS : chemin du fichier JSON (lu par le SDK lui-même).
 */
export type ServiceAccountCredential = {
  projectId?: string;
  clientEmail: string;
  privateKey: string;
};

export function serviceAccountFromEnv(
  env: Record<string, string | undefined> = process.env,
): ServiceAccountCredential | null {
  const email = env.FIREBASE_CLIENT_EMAIL?.trim();
  const key = env.FIREBASE_PRIVATE_KEY?.trim();
  if (email && key) {
    // Les interfaces web enregistrent souvent les retours à la ligne sous la forme « \n ».
    return { clientEmail: email, privateKey: key.replace(/^"|"$/g, "").replace(/\\n/g, "\n") };
  }
  const json = env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    const sa = JSON.parse(json) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!sa.client_email || !sa.private_key) throw new Error("FIREBASE_SERVICE_ACCOUNT incomplet.");
    return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key };
  }
  return null;
}

export function hasCredentials(env: Record<string, string | undefined> = process.env): boolean {
  return serviceAccountFromEnv(env) !== null || !!env.GOOGLE_APPLICATION_CREDENTIALS;
}
