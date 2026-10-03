import { Timestamp } from "firebase-admin/firestore";

/** Timestamp Firestore → ISO 8601 (sérialisable par le cache), sinon null. */
export function toIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return null;
}

/** « 2026-09-18 » → Timestamp à midi UTC (la date affichée ne bascule pas selon le fuseau). */
export function dayToTimestamp(day: string): Timestamp {
  return Timestamp.fromDate(new Date(`${day}T12:00:00.000Z`));
}

/** Timestamp → « 2026-09-18 ». */
export function timestampToDay(value: unknown): string {
  return toIso(value)?.slice(0, 10) ?? "";
}

export function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function urlOrNull(value: unknown): string | null {
  return typeof value === "string" && /^https?:\/\//.test(value) ? value : null;
}
