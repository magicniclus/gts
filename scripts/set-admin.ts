/**
 * Pose le claim admin sur un compte : npm run set-admin -- <email>
 * Émulateur uniquement : --create <mot-de-passe> crée le compte s’il n’existe pas.
 */
import { auth, USE_EMULATORS } from "./lib/admin";

async function main() {
  const [email, flag, password] = process.argv.slice(2);
  if (!email) throw new Error("Usage : npm run set-admin -- <email> [--create <mot-de-passe>]");
  let user = await auth.getUserByEmail(email).catch((e: unknown) => {
    // Seul « compte introuvable » est attendu ; toute autre erreur (identifiants, projet…) est affichée.
    if ((e as { code?: string }).code === "auth/user-not-found") return null;
    throw e;
  });
  if (!user) {
    if (flag !== "--create" || !password)
      throw new Error(`Aucun compte pour ${email}. Créez-le dans la console Firebase.`);
    if (!USE_EMULATORS)
      throw new Error("--create est réservé à l’émulateur : créez le compte dans la console.");
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log(`Compte créé : ${email}`);
  }
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  await auth.revokeRefreshTokens(user.uid);
  console.log(`Claim admin posé sur ${email}. Reconnexion nécessaire.`);
}

main().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
