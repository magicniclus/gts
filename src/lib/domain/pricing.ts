/**
 * Prix et estimation. Port du bloc « devis » de renderVals() dans
 * docs/handoff/design/Devis.dc.html (voir 03-tarifs-et-obligations.md §3 et §4).
 * Calculs en entiers : jamais de × 1,15 flottant.
 */
import { isDefaultChecked, isSelectable } from "./obligations";
import { BANDS } from "./types";
import type {
  Answers,
  CommuneInfo,
  Estimate,
  Obligation,
  PriceKey,
  Pricing,
  PricingRules,
  Row,
} from "./types";

const MAISON_KEYS: ReadonlySet<string> = new Set([
  "dpe",
  "amiante",
  "plomb",
  "electricite",
  "termites",
]);
const ANNEXE_KEYS: ReadonlySet<string> = new Set(["amiante", "termites", "raat"]);

/** Arrondi aux 5 € les plus proches (moitié vers le haut). */
export function round5(value: number): number {
  return Math.round(value / 5) * 5;
}

type BandIndex = 0 | 1 | 2 | 3 | 4;

/** Tranche de surface ; la première si la surface n’est pas encore renseignée. */
function bandIndex(a: Answers): BandIndex {
  return (a.surface ? BANDS.indexOf(a.surface) : 0) as BandIndex;
}

function isPriceKey(key: string, pricing: Pricing): key is PriceKey {
  return Object.hasOwn(pricing.grid, key);
}

export function priceOf(key: Obligation["priceKey"], a: Answers, pricing: Pricing): number | null {
  if (key === "erp") return 0;
  if (!isPriceKey(key, pricing)) return null;
  if (a.type === "immeuble") return null;
  const base = pricing.grid[key][bandIndex(a)];
  const { maison, annexe } = pricing.rules;
  // Tout est exprimé en centièmes d’euro pour rester en entiers.
  let cents = base * (a.type === "maison" && MAISON_KEYS.has(key) ? 100 + maison : 100);
  if (ANNEXE_KEYS.has(key)) {
    const n = (a.annexes ?? []).filter((x) => x !== "piscine").length;
    cents += annexe * n * 100;
  }
  return Math.round(cents / 500) * 5;
}

/**
 * Associe prix et état coché à chaque obligation.
 * `checked` : liste des id cochés par le client (jamais de prix). Absente : cases par défaut.
 */
export function buildRows(
  obligations: readonly Obligation[],
  a: Answers,
  pricing: Pricing,
  checked?: readonly string[],
): Row[] {
  return obligations.map((o) => {
    const selectable = isSelectable(o.level);
    const on = selectable && (checked ? checked.includes(o.id) : isDefaultChecked(o.level));
    return {
      ...o,
      on,
      price: selectable ? priceOf(o.priceKey, a, pricing) : null,
    };
  });
}

export function deplacementFor(commune: CommuneInfo | undefined, rules: PricingRules): number {
  if (!commune) return 0;
  if (commune.km > 40) return rules.d40;
  if (commune.km > 30) return rules.d30;
  return 0;
}

export function estimate(
  rows: readonly Row[],
  commune: CommuneInfo | undefined,
  pricing: Pricing,
): Estimate {
  const selected = rows.filter((r) => r.on);
  const paid = selected.filter(
    (r): r is Row & { price: number } => r.price !== null && r.price > 0,
  );
  const surDevis = selected.some((r) => r.price === null && r.id !== "spanc");
  const sub = paid.reduce((total, r) => total + r.price, 0);
  const pack = paid.length >= pricing.rules.packMin;
  const remise = pack ? Math.round((sub * pricing.rules.packPct) / 500) * 5 : 0;
  const deplacement = deplacementFor(commune, pricing.rules);
  return {
    sub,
    remise,
    deplacement,
    total: sub - remise + deplacement,
    surDevis,
    pack,
    paidCount: paid.length,
  };
}

/** Prix « dès » des pages diagnostic et ville : première tranche de la grille. */
export function fromPrice(key: PriceKey, pricing: Pricing): number {
  return pricing.grid[key][0];
}

const euros = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** « Offert » si 0, « Sur devis » si null, sinon « 1 015 € » (espaces insécables). */
export function formatPrice(price: number | null): string {
  if (price === null) return "Sur devis";
  if (price === 0) return "Offert";
  return formatEuros(price);
}

export function formatEuros(value: number): string {
  return `${euros.format(value)} €`;
}

/** Prix « dès » d’un diagnostic (fiche) : sa grille si elle existe, sinon 0 (ERP offert). */
export function diagnosticFromPrice(id: string, pricing: Pricing): number {
  return isPriceKey(id, pricing) ? fromPrice(id, pricing) : 0;
}
