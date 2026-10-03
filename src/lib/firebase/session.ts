import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./admin";

/** Nom imposé par Firebase App Hosting / Hosting : seul « __session » est transmis au serveur. */
export const SESSION_COOKIE = "__session";
export const SESSION_DAYS = 5;
export const LOGIN_PATH = "/espace-proprietaire/connexion";

export type AdminSession = { uid: string; email: string | null };

/** Vérifie le cookie de session (avec contrôle de révocation) et le claim admin. */
export async function verifyAdminSession(cookie: string | undefined): Promise<AdminSession | null> {
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    if (decoded.admin !== true) return null;
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifyAdminSession(jar.get(SESSION_COOKIE)?.value);
}

/** Garde des pages et des Server Actions de l’espace propriétaire. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

/** Variante pour les Server Actions : lève une erreur au lieu de rediriger. */
export async function assertAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Session expirée : reconnectez-vous.");
  return session;
}
