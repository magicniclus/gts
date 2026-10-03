/** Convertit docs/handoff/data/leads-exemples.json au format Firestore de 02-firebase.md. */
import { Timestamp } from "firebase-admin/firestore";
import raw from "../../docs/handoff/data/leads-exemples.json";
import { COMMUNES } from "../../src/lib/data/communes";
import { DEVIS_OPTIONS } from "../../src/lib/data/devis-options";

type Raw = (typeof raw)[number];

const STATUS: Record<string, string> = {
  Nouveau: "nouveau",
  Rappelé: "rappele",
  "Devis envoyé": "devis_envoye",
  Gagné: "gagne",
  Perdu: "perdu",
};

function valueOf(key: keyof typeof DEVIS_OPTIONS, label: string | undefined): string | undefined {
  if (!label) return undefined;
  const list: readonly { value: string; label: string }[] = DEVIS_OPTIONS[key];
  return list.find((o) => o.label === label.trim())?.value;
}

function lead(l: Raw) {
  const [projetLabel, locLabel] = l.projet.split(" · ");
  const [typeLabel, surfaceLabel] = l.bien.split(" · ");
  const [delaiLabel, creneauLabel] = l.delai.split(" · ");
  const commune = COMMUNES.find((c) => c.name === l.commune);
  const projet = valueOf("projet", projetLabel) ?? "autre";
  return {
    ref: l.id,
    createdAt: Timestamp.fromDate(new Date(`${l.date}+02:00`)),
    status: STATUS[l.status] ?? "nouveau",
    contact: {
      nom: l.nom,
      tel: l.tel,
      email: l.email || null,
      profil: valueOf("profil", l.profil) ?? "particulier",
    },
    bien: {
      projet,
      ...(projet === "location" ? { loc: valueOf("loc", locLabel) ?? "vide" } : {}),
      type: valueOf("type", typeLabel) ?? "appartement",
      commune: commune?.slug ?? "marseille-1er",
      adresse: l.adresse,
      surface: valueOf("surface", surfaceLabel) ?? "30-60",
      annee: valueOf("annee", l.annee) ?? "nsp",
      annexes: [],
      deja: [],
    },
    rdv: {
      delai: valueOf("delai", delaiLabel) ?? "flexible",
      ...(creneauLabel ? { creneau: valueOf("creneau", creneauLabel) } : {}),
    },
    message: l.message,
    diagnostics: l.diags.map((name) => ({ id: name, name, level: "Obligatoire", price: null })),
    estimate: { sub: l.total, remise: 0, deplacement: 0, total: l.total, surDevis: false },
    notes: "",
    consent: { at: Timestamp.fromDate(new Date(`${l.date}+02:00`)), text: "Exemple" },
    meta: { ip: "exemple", userAgent: "seed", source: "site" },
  };
}

export function buildSeedLeads(): [string, Record<string, unknown>][] {
  return raw.map((l) => [l.id, lead(l)]);
}
