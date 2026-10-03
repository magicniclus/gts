import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "__session";
const LOGIN_PATH = "/espace-proprietaire/connexion";

/**
 * Protège /espace-proprietaire (hors connexion) : sans cookie de session, redirection.
 * La vérification complète (signature, révocation, claim admin) se fait dans le layout protégé.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith(LOGIN_PATH)) return NextResponse.next();
  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search =
      pathname === "/espace-proprietaire"
        ? ""
        : `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/espace-proprietaire", "/espace-proprietaire/:path*"] };
