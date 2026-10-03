"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { telHref } from "@/components/site/PhoneLink";
import { cx } from "@/lib/cx";
import { formatEuros } from "@/lib/domain/pricing";
import type { ActionResult } from "@/lib/admin/result";
import type { LeadView } from "@/lib/repos/leads";
import type { LeadStatus } from "@/lib/schemas/lead";
import { StatusSelect } from "./StatusSelect";
import { useToast } from "./Toast";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export type LeadActions = {
  setStatus: (i: { id: string; status: LeadStatus }) => Promise<ActionResult>;
  setNotes: (i: { id: string; notes: string }) => Promise<ActionResult>;
  remove: (i: { id: string }) => Promise<ActionResult>;
};

/** Ligne repliable d’une demande : résumé, statut, puis détail (faits, diagnostics, message, notes). */
export function LeadRow({
  lead,
  open,
  onToggle,
  onChange,
  onRemoved,
  actions,
}: {
  lead: LeadView;
  open: boolean;
  onToggle: () => void;
  onChange: (l: LeadView) => void;
  onRemoved: () => void;
  actions: LeadActions;
}) {
  const toast = useToast();
  const [notes, setNotes] = useState(lead.notes);
  const [pending, start] = useTransition();
  const panel = `lead-${lead.id}`;
  const facts = [
    ["Profil", lead.profil],
    ["Bien", lead.bien || "—"],
    ["Construction", lead.annee],
    ["Rendez-vous", lead.rdv || "—"],
    ["Adresse", lead.adresse || lead.commune],
    ["E-mail", lead.email ?? "—"],
  ];

  const changeStatus = (status: LeadStatus) => {
    const previous = lead.status;
    onChange({ ...lead, status });
    start(async () => {
      const r = await actions.setStatus({ id: lead.id, status });
      if (r.ok) toast("success", "Statut enregistré.");
      else {
        onChange({ ...lead, status: previous });
        toast("error", r.error);
      }
    });
  };

  return (
    <li
      className={cx(
        "rounded-card-sm border-[1.5px] bg-white",
        open ? "border-accent" : "border-transparent",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 py-2 pr-3.5 pl-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panel}
          className="grid min-w-0 flex-[1_1_360px] cursor-pointer grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_auto] items-center gap-x-5 gap-y-1 rounded-field px-3 py-2.5 text-left hover:bg-surface"
        >
          <span className="grid min-w-0 gap-0.5">
            <strong className="truncate text-base font-bold">{lead.nom}</strong>
            <span className="text-[13px] text-text/65">
              {lead.createdAt ? dateFmt.format(new Date(lead.createdAt)).replace(" à ", " · ") : ""}{" "}
              · {lead.ref}
            </span>
          </span>
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-[15px] font-semibold">{lead.commune}</span>
            <span className="truncate text-[13px] text-text/65">
              {lead.projet} · {lead.diagnostics.length} diag.
            </span>
          </span>
          <span className="text-lg font-extrabold whitespace-nowrap text-accent-900 stretch-112">
            {lead.total ? formatEuros(lead.total) : "Sur devis"}
          </span>
        </button>
        <StatusSelect value={lead.status} onChange={changeStatus} label={`Statut de ${lead.ref}`} />
      </div>
      {open && (
        <div id={panel} className="grid gap-[18px] px-[22px] pt-1 pb-[22px]">
          <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-x-6 gap-y-3.5">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold tracking-widest text-text/55 uppercase">{k}</dt>
                <dd className="m-0 mt-1 text-[15px] leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <div className="text-xs font-bold tracking-widest text-text/55 uppercase">
              Diagnostics retenus
            </div>
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {lead.diagnostics.map((d) => (
                <li
                  key={d}
                  className="rounded-pill bg-accent-100 px-3 py-1 text-[13px] font-semibold text-accent-800"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {lead.message && (
            <p className="m-0 rounded-field bg-surface px-4 py-3.5 text-[15px] leading-normal italic">
              « {lead.message} »
            </p>
          )}
          <Field
            id={`notes-${lead.id}`}
            label="Notes internes"
            hint="Visibles uniquement dans votre espace."
          >
            <Textarea
              id={`notes-${lead.id}`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-describedby={`notes-${lead.id}-hint`}
            />
          </Field>
          <div className="flex flex-wrap gap-2.5">
            <Button href={telHref(lead.tel)} icon="phone" iconPosition="start" size="sm">
              Appeler {lead.tel}
            </Button>
            {lead.email && (
              <Button
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Votre demande ${lead.ref}`)}`}
                variant="secondary"
                icon="envelope-simple"
                iconPosition="start"
                size="sm"
              >
                Répondre par e-mail
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={pending || notes === lead.notes}
              onClick={() =>
                start(async () => {
                  const r = await actions.setNotes({ id: lead.id, notes });
                  if (r.ok) {
                    onChange({ ...lead, notes });
                    toast("success", "Notes enregistrées.");
                  } else toast("error", r.error);
                })
              }
            >
              Enregistrer les notes
            </Button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(`Supprimer définitivement la demande ${lead.ref} ?`)) return;
                start(async () => {
                  const r = await actions.remove({ id: lead.id });
                  if (r.ok) {
                    toast("success", "Demande supprimée.");
                    onRemoved();
                  } else toast("error", r.error);
                });
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-field px-3.5 text-sm font-semibold text-danger-fg hover:bg-danger-bg"
            >
              <Icon name="trash" size={18} />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
