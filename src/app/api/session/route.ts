import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_DAYS, verifyAdminSession } from "@/lib/firebase/session";

const MAX_AUTH_AGE_S = 5 * 60;
const GENERIC = { error: "E-mail ou mot de passe incorrect." };

/** Refuse les requêtes venant d’un autre site (protection CSRF des route handlers). */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cookieOptions(req: NextRequest, maxAge: number) {
  return {
    httpOnly: true,
    // Toujours « secure », sauf en local (http://localhost).
    secure: !/^(localhost|127\.0\.0\.1)$/.test(req.nextUrl.hostname),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Échange un idToken Firebase (connexion récente, claim admin) contre un cookie de session. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json(GENERIC, { status: 403 });
  let idToken: unknown;
  try {
    idToken = ((await req.json()) as { idToken?: unknown }).idToken;
  } catch {
    return NextResponse.json(GENERIC, { status: 400 });
  }
  if (typeof idToken !== "string" || !idToken) return NextResponse.json(GENERIC, { status: 400 });
  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    const recent = Date.now() / 1000 - decoded.auth_time < MAX_AUTH_AGE_S;
    if (decoded.admin !== true || !recent) return NextResponse.json(GENERIC, { status: 401 });
    const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
    const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, cookieOptions(req, expiresIn / 1000));
    return res;
  } catch {
    return NextResponse.json(GENERIC, { status: 401 });
  }
}

/** Déconnexion : révoque les jetons et efface le cookie. */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const session = await verifyAdminSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) {
    try {
      await adminAuth().revokeRefreshTokens(session.uid);
    } catch {
      // Le cookie est effacé quoi qu’il arrive.
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(req, 0), maxAge: 0 });
  return res;
}
