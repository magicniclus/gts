const longDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** « 2026-09-18 » → « 18 septembre 2026 ». */
export function formatDay(day: string, style: "long" | "short" = "long"): string {
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return (style === "long" ? longDate : shortDate).format(d);
}
