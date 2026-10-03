/**
 * URL absolue du site, sans barre finale. Jamais de domaine en dur :
 * tout passe par NEXT_PUBLIC_SITE_URL (voir docs/handoff/02-firebase.md).
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
