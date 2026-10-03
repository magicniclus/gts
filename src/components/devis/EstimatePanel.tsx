import { Icon } from "@/components/ui/Icon";
import { telHref } from "@/components/site/PhoneLink";
import { findCommune } from "@/lib/data/lookup";
import { optionLabel } from "@/lib/data/devis-options";
import { formatEuros } from "@/lib/domain/pricing";
import type { Estimate, Row } from "@/lib/domain/types";
import type { DevisForm } from "./types";

export function recapLines(f: DevisForm): string[] {
  const annee = optionLabel("annee", f.annee);
  return [
    optionLabel("projet", f.projet),
    [optionLabel("type", f.type), optionLabel("surface", f.surface)].filter(Boolean).join(" · "),
    f.commune ? findCommune(f.commune)?.name : undefined,
    annee ? `Permis : ${annee.toLowerCase()}` : undefined,
  ].filter((x): x is string => !!x);
}

/** Panneau navy collant : récapitulatif, diagnostics retenus, estimation, remise. */
export function EstimatePanel({
  f,
  rows,
  estimate: e,
  packPct,
  phone,
}: {
  f: DevisForm;
  rows: readonly Row[];
  estimate: Estimate;
  packPct: number;
  phone: string;
}) {
  const recap = recapLines(f);
  const chosen = rows.filter((r) => r.on);
  const show = e.paidCount > 0 || e.surDevis;
  return (
    <aside
      className="sticky top-[100px] grid max-w-[400px] flex-[1_1_300px] gap-3.5 max-md:static max-md:max-w-none"
      aria-label="Votre dossier"
    >
      <div className="rounded-hero bg-accent-900 p-[26px] text-white">
        <div className="text-xs font-bold tracking-[0.14em] text-accent-400 uppercase">
          Votre dossier
        </div>
        {recap.length ? (
          <ul className="m-0 mt-3 grid list-none gap-1 p-0 text-sm leading-normal text-white/82">
            {recap.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 mb-0 text-sm leading-normal text-white/75">
            Répondez aux questions : les diagnostics obligatoires s’affichent ici en direct.
          </p>
        )}
        {chosen.length > 0 && (
          <ul className="m-0 mt-[18px] grid list-none gap-2 border-t border-white/14 p-0 pt-[18px]">
            {chosen.map((c) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm font-semibold">
                <Icon name="check-circle" size={18} className="flex-none text-accent-400" />
                {c.name}
              </li>
            ))}
          </ul>
        )}
        {show && (
          <div
            className="mt-5 grid gap-2 border-t border-white/14 pt-[18px] text-sm"
            aria-live="polite"
          >
            <div className="flex justify-between text-white/78">
              <span>Diagnostics ({e.paidCount})</span>
              <span>{formatEuros(e.sub)}</span>
            </div>
            {e.pack && (
              <div className="flex justify-between font-bold text-accent-2">
                <span>Remise pack −{packPct}&nbsp;%</span>
                <span>− {formatEuros(e.remise)}</span>
              </div>
            )}
            <div className="flex justify-between text-white/78">
              <span>Déplacement</span>
              <span>{e.deplacement ? formatEuros(e.deplacement) : "Inclus"}</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-3 border-t border-white/14 pt-3">
              <span className="text-[13px] text-white/78">Total estimé TTC</span>
              <span
                className="text-[32px] font-extrabold whitespace-nowrap text-white stretch-118"
                data-testid="total"
              >
                {formatEuros(e.total)}
              </span>
            </div>
            {e.surDevis && (
              <span className="text-xs text-white/78">
                Immeuble entier : chiffrage par lot, sur devis.
              </span>
            )}
            <span className="text-xs text-white/62">
              Calculé selon la surface, le type de bien, les annexes et la commune. Prix ferme
              confirmé avant intervention.
            </span>
          </div>
        )}
      </div>
      <a
        href={telHref(phone)}
        className="flex items-center gap-3.5 rounded-card bg-white px-[18px] py-4 text-text hover:text-accent"
      >
        <span className="grid size-[42px] flex-none place-items-center rounded-full bg-accent-100 text-accent">
          <Icon name="phone" size={20} />
        </span>
        <span className="grid gap-0.5">
          <span className="text-[13px] text-text/65">Une question ? Guillaume répond</span>
          <strong className="text-[17px] font-extrabold">{phone}</strong>
        </span>
      </a>
    </aside>
  );
}
