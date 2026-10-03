import "server-only";
import { findCommune } from "@/lib/data/lookup";
import { optionLabel } from "@/lib/data/devis-options";
import { adminDb } from "@/lib/firebase/admin";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/schemas/lead";
import { str, toIso } from "./convert";

const col = () => adminDb().collection("leads");

/** Nombre de demandes au statut « nouveau » (badge de la barre latérale). */
export async function countNewLeads(): Promise<number> {
  const snap = await col().where("status", "==", "nouveau").count().get();
  return snap.data().count;
}

export type LeadView = {
  id: string;
  ref: string;
  createdAt: string;
  status: LeadStatus;
  nom: string;
  tel: string;
  email: string | null;
  profil: string;
  commune: string;
  adresse: string;
  projet: string;
  bien: string;
  annee: string;
  rdv: string;
  diagnostics: string[];
  total: number;
  surDevis: boolean;
  message: string;
  notes: string;
};

function view(id: string, d: Record<string, unknown>): LeadView {
  const contact = (d.contact ?? {}) as Record<string, string | null>;
  const bien = (d.bien ?? {}) as Record<string, string | undefined>;
  const rdv = (d.rdv ?? {}) as Record<string, string | undefined>;
  const estimate = (d.estimate ?? {}) as Record<string, unknown>;
  const diagnostics = Array.isArray(d.diagnostics) ? (d.diagnostics as { name?: string }[]) : [];
  const status = (LEAD_STATUSES as readonly string[]).includes(String(d.status))
    ? (d.status as LeadStatus)
    : "nouveau";
  return {
    id,
    ref: str(d.ref, id),
    createdAt: toIso(d.createdAt) ?? "",
    status,
    nom: contact.nom ?? "",
    tel: contact.tel ?? "",
    email: contact.email ?? null,
    profil: optionLabel("profil", contact.profil ?? undefined) ?? "—",
    commune:
      bien.communeNom ??
      (bien.commune ? findCommune(bien.commune)?.name : undefined) ??
      bien.commune ??
      "—",
    adresse: bien.adresse ?? "",
    projet: [
      optionLabel("projet", bien.projet),
      optionLabel("loc", bien.loc),
      optionLabel("nature", bien.nature),
    ]
      .filter(Boolean)
      .join(" · "),
    bien: [optionLabel("type", bien.type), optionLabel("surface", bien.surface)]
      .filter(Boolean)
      .join(" · "),
    annee: optionLabel("annee", bien.annee) ?? "—",
    rdv: [
      optionLabel("delai", rdv.delai),
      optionLabel("creneau", rdv.creneau),
      optionLabel("acces", rdv.acces),
    ]
      .filter(Boolean)
      .join(" · "),
    diagnostics: diagnostics.map((x) => x.name ?? "").filter(Boolean),
    total: Number(estimate.total) || 0,
    surDevis: estimate.surDevis === true,
    message: str(d.message, ""),
    notes: str(d.notes, ""),
  };
}

/** Toutes les demandes, des plus récentes aux plus anciennes (espace propriétaire). */
export async function listLeads(): Promise<LeadView[]> {
  const snap = await col().orderBy("createdAt", "desc").limit(500).get();
  return snap.docs.map((doc) => view(doc.id, doc.data()));
}
