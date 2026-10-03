/** Brouillon transmis de la carte du hero au formulaire /devis (sessionStorage). */
export const DRAFT_KEY = "gts-draft";

export type DevisDraft = { projet?: string; type?: string; commune?: string };

export function saveDraft(draft: DevisDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Stockage indisponible (navigation privée) : le formulaire repart de zéro.
  }
}

/** Lit puis efface le brouillon. */
export function takeDraft(): DevisDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(DRAFT_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const d = parsed as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
    return { projet: str(d.projet), type: str(d.type), commune: str(d.commune) };
  } catch {
    return null;
  }
}
