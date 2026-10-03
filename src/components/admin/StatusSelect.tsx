"use client";

import { cx } from "@/lib/cx";
import type { LeadStatus } from "@/lib/schemas/lead";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  nouveau: "Nouveau",
  rappele: "Rappelé",
  devis_envoye: "Devis envoyé",
  gagne: "Gagné",
  perdu: "Perdu",
};

const TONES: Record<LeadStatus, string> = {
  nouveau: "bg-accent text-white",
  rappele: "bg-accent-100 text-accent-800",
  devis_envoye: "bg-warning-bg text-warning-fg",
  gagne: "bg-success-bg text-success-fg",
  perdu: "bg-divider text-neutral-fg",
};

/** Menu de statut coloré d’une demande. */
export function StatusSelect({
  value,
  onChange,
  label,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
  label: string;
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={cx(
        "min-h-11 cursor-pointer appearance-none rounded-pill border-0 px-3.5 text-[13px] font-bold",
        TONES[value],
      )}
    >
      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
