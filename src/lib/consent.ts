/** Choix cookies (GA4 uniquement), mémorisé 6 mois dans le navigateur. */
export const CONSENT_KEY = "gts-consent";
export const CONSENT_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;
export const CONSENT_EVENT = "gts-consent-change";

export type ConsentChoice = "granted" | "denied";

export function readConsent(now = Date.now()): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw) as { value?: unknown; at?: unknown };
    if ((value !== "granted" && value !== "denied") || typeof at !== "number") return null;
    return now - at > CONSENT_MAX_AGE_MS ? null : value;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentChoice, now = Date.now()): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, at: now }));
  } catch {
    // Stockage indisponible : le bandeau réapparaîtra.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignoré
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
