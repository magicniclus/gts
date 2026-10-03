import { createHmac } from "node:crypto";
import { USE_EMULATORS } from "@/lib/firebase/config";

export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;

/** HMAC-SHA256 de l’IP avec le secret IP_HASH_SALT : l’IP en clair n’est jamais stockée. */
export function hashIp(ip: string, salt = process.env.IP_HASH_SALT): string {
  if (!salt) {
    if (!USE_EMULATORS) throw new Error("IP_HASH_SALT manquant.");
    salt = "dev-salt";
  }
  return createHmac("sha256", salt).update(ip).digest("hex");
}

export type RateState = { count: number; windowStart: number };

/** Décide si une nouvelle demande est acceptée et renvoie l’état suivant (fenêtre fixe d’une heure). */
export function nextRateState(
  current: RateState | null,
  now: number,
): { allowed: boolean; state: RateState } {
  if (!current || now - current.windowStart >= RATE_LIMIT.windowMs) {
    return { allowed: true, state: { count: 1, windowStart: now } };
  }
  if (current.count >= RATE_LIMIT.max) return { allowed: false, state: current };
  return { allowed: true, state: { count: current.count + 1, windowStart: current.windowStart } };
}

/** Première IP de X-Forwarded-For (proxy d’App Hosting), sinon X-Real-IP. */
export function clientIp(h: { get(name: string): string | null }): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}
