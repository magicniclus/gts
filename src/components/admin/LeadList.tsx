"use client";

import { useState } from "react";
import { formatEuros } from "@/lib/domain/pricing";
import type { LeadView } from "@/lib/repos/leads";
import { LeadRow, type LeadActions } from "./LeadRow";
import { StatCard } from "./StatCard";

/** Statistiques et liste des demandes. `initialOpen` : ?id= du lien de l’e-mail. */
export function LeadList({
  leads: initial,
  initialOpen,
  actions,
}: {
  leads: LeadView[];
  initialOpen?: string | null;
  actions: LeadActions;
}) {
  const [leads, setLeads] = useState(initial);
  const [open, setOpen] = useState<string | null>(initialOpen ?? null);
  const nNew = leads.filter((l) => l.status === "nouveau").length;
  const pipe = leads
    .filter((l) => l.status !== "perdu" && l.status !== "gagne")
    .reduce((a, l) => a + l.total, 0);
  return (
    <>
      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
        <StatCard value={String(nNew)} label="Nouvelles demandes" />
        <StatCard value={String(leads.length)} label="Demandes au total" />
        <StatCard value={formatEuros(pipe)} label="Estimé en cours (hors gagnés)" />
      </div>
      {leads.length === 0 ? (
        <p className="mt-5 rounded-card-sm bg-white p-7 text-center text-[15px]">
          Aucune demande pour le moment.
        </p>
      ) : (
        <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
          {leads.map((l) => (
            <LeadRow
              key={l.id}
              lead={l}
              open={open === l.id}
              onToggle={() => setOpen(open === l.id ? null : l.id)}
              onChange={(n) => setLeads((all) => all.map((x) => (x.id === n.id ? n : x)))}
              onRemoved={() => setLeads((all) => all.filter((x) => x.id !== l.id))}
              actions={actions}
            />
          ))}
        </ul>
      )}
    </>
  );
}
