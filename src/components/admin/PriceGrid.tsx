"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { fieldClasses } from "@/components/ui/Field";
import { cx } from "@/lib/cx";
import { PRICE_KEYS } from "@/lib/domain/types";
import type { ActionResult } from "@/lib/admin/result";
import {
  BAND_LABELS,
  PRICE_ROW_LABELS,
  RULE_FIELDS,
  pricingSchema,
  type PricingInput,
} from "@/lib/schemas/pricing";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useSaveForm } from "./useSaveForm";

type Props = {
  initial: PricingInput;
  defaults: PricingInput;
  updatedAt: string | null;
  save: (v: PricingInput) => Promise<ActionResult>;
};

/** Tableau 10 × 5 des prix, règles de calcul, bouton Enregistrer explicite. */
export function PriceGrid({ initial, defaults, updatedAt, save }: Props) {
  const form = useForm<PricingInput>({
    resolver: zodResolver(pricingSchema),
    defaultValues: initial,
    mode: "onChange",
  });
  const { submit, savedAt, pending, dirty } = useSaveForm(form, save, updatedAt);
  const { errors } = form.formState;
  const num = { valueAsNumber: true } as const;

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Tarifs"
        sub="Prix par tranche de surface et règles appliquées à l’estimation du formulaire."
        aside={<SavedLabel savedAt={savedAt} dirty={dirty} />}
      />
      <div className="mt-7 overflow-x-auto rounded-card bg-white px-2 pt-2 pb-1">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <caption className="sr-only">
            Prix en euros TTC par diagnostic et par tranche de surface
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-1 bg-white px-3.5 py-3.5 text-left text-[13px] font-bold text-text/65 max-sm:px-2"
              >
                Diagnostic · € TTC
              </th>
              {BAND_LABELS.map((b) => (
                <th
                  key={b}
                  scope="col"
                  className="px-2.5 py-3.5 text-right text-[13px] font-bold whitespace-nowrap text-text/65"
                >
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICE_KEYS.map((k) => (
              <tr key={k} className="border-t border-divider">
                <th
                  scope="row"
                  className="sticky left-0 z-1 bg-white px-3.5 py-2 text-left font-semibold whitespace-nowrap max-sm:max-w-[130px] max-sm:px-2 max-sm:text-sm max-sm:whitespace-normal"
                >
                  {PRICE_ROW_LABELS[k]}
                </th>
                {BAND_LABELS.map((b, i) => {
                  const err = errors.grid?.[k]?.[i];
                  return (
                    <td key={b} className="px-1.5 py-1.5 text-right">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        inputMode="numeric"
                        aria-label={`${PRICE_ROW_LABELS[k]}, ${b}`}
                        aria-invalid={err ? true : undefined}
                        title={err?.message}
                        className={cx(fieldClasses, "w-[88px]! text-right tabular-nums")}
                        {...form.register(`grid.${k}.${i as 0 | 1 | 2 | 3 | 4}`, num)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.grid && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger-fg">
          Les prix doivent être des nombres entiers positifs.
        </p>
      )}

      <h2 className="mt-9 mb-3.5 text-xl font-extrabold text-accent-900">Règles de calcul</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-x-6 gap-y-[18px] rounded-card bg-white p-6">
        {RULE_FIELDS.map((r) => {
          const err = errors.rules?.[r.key];
          return (
            <div key={r.key}>
              <label htmlFor={`rule-${r.key}`} className="mb-1.5 block text-sm font-bold">
                {r.label}
              </label>
              <span className="flex items-center gap-2.5">
                <input
                  id={`rule-${r.key}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  aria-invalid={err ? true : undefined}
                  className={cx(fieldClasses, "w-[110px]! text-right")}
                  {...form.register(`rules.${r.key}`, num)}
                />
                <span className="text-text/65">{r.unit}</span>
              </span>
              {err && (
                <p className="mt-1 mb-0 text-[13px] font-semibold text-danger-fg">{err.message}</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 mb-0 max-w-[70ch] text-sm leading-normal text-text/70">
        Le premier palier (moins de 30 m²) sert de prix « dès » sur les pages diagnostic et ville.
        La majoration maison s’applique au DPE, à l’amiante, au plomb, à l’électricité et aux
        termites ; le supplément par annexe à l’amiante et aux termites. L’ERP reste offert.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          variant="secondary"
          icon="arrow-counter-clockwise"
          iconPosition="start"
          onClick={() => form.reset(defaults, { keepDefaultValues: true })}
        >
          Rétablir les tarifs par défaut
        </Button>
      </div>
    </form>
  );
}
