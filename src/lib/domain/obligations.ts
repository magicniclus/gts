/**
 * Diagnostics obligatoires selon les réponses du formulaire.
 * Port fidèle de diagList() de docs/handoff/design/Devis.dc.html
 * (voir docs/handoff/03-tarifs-et-obligations.md §2).
 */
import { DIAGNOSTICS } from "../data/diagnostics";
import type { Answers, CommuneInfo, Level, Obligation, ObligationId, PriceKey } from "./types";

const DEFAULT_CHECKED: ReadonlySet<Level> = new Set<Level>(["Obligatoire", "À vérifier"]);

/** Les lignes Obligatoire et À vérifier sont cochées par défaut. */
export function isDefaultChecked(level: Level): boolean {
  return DEFAULT_CHECKED.has(level);
}

/** Le client peut cocher ou décocher toutes les lignes, sauf Info. */
export function isSelectable(level: Level): boolean {
  return level !== "Info";
}

export function diagList(a: Answers, commune?: CommuneInfo): Obligation[] {
  const p = a.projet;
  const y = a.annee;
  const t = a.type;
  const deja = a.deja ?? [];
  const hab = t !== "local";
  const vl = p === "vente" || p === "location";
  const sais = p === "location" && a.loc === "saisonniere";
  const unk = y === "nsp" || y === undefined;
  const pre97 = y === "avant1949" || y === "1949-1997";
  const pre49 = y === "avant1949";
  const has = (k: (typeof deja)[number]) => deja.includes(k);

  const list: Obligation[] = [];
  const add = (
    id: ObligationId,
    level: Level,
    reason: string,
    name?: string,
    priceKey?: Obligation["priceKey"],
  ) => {
    list.push({
      id,
      level,
      reason,
      name: name ?? (id === "spanc" ? "Assainissement non collectif" : DIAGNOSTICS[id].long),
      priceKey: priceKey ?? (id as PriceKey | "erp" | "spanc"),
    });
  };

  if (vl) {
    const local = t === "local";
    const name = local ? "DPE tertiaire" : undefined;
    const pk = local ? "dpet" : "dpe";
    if (has("dpe"))
      add("dpe", "Déjà valide", "DPE réalisé après le 1er juillet 2021, valable 10 ans", name, pk);
    else
      add(
        "dpe",
        "Obligatoire",
        sais
          ? "Exigé pour déclarer un meublé de tourisme"
          : local
            ? "Vente ou location d’un local professionnel"
            : "Vente ou location d’un logement",
        name,
        pk,
      );
  } else if (p === "autre") add("dpe", "Optionnel", "Connaître la performance énergétique du bien");

  if (p === "travaux") {
    if (pre97 || unk) {
      const demo = a.nature === "demolition";
      add(
        "amiante",
        unk ? "À vérifier" : "Obligatoire",
        demo
          ? "Repérage avant démolition — permis antérieur à juillet 1997"
          : "Repérage avant travaux (RAAT) — permis antérieur à juillet 1997",
        demo ? "Amiante avant démolition" : "Amiante avant travaux",
        "raat",
      );
    }
  } else if (p === "vente" && (pre97 || unk)) {
    add(
      "amiante",
      has("amiante") ? "Déjà valide" : unk ? "À vérifier" : "Obligatoire",
      has("amiante")
        ? "Constat sans amiante réalisé après le 1er avril 2013"
        : "Permis de construire antérieur au 1er juillet 1997",
    );
  } else if (
    p === "location" &&
    !sais &&
    hab &&
    (pre97 || unk) &&
    (a.copro === "oui" || t === "appartement")
  ) {
    add(
      "amiante",
      has("amiante") ? "Déjà valide" : unk ? "À vérifier" : "Obligatoire",
      "Dossier amiante parties privatives (DAPP), à tenir à disposition du locataire",
      "Amiante (DAPP)",
    );
  }

  if (hab && vl && !sais && (pre49 || unk))
    add(
      "plomb",
      has("plomb") ? "Déjà valide" : unk ? "À vérifier" : "Obligatoire",
      "Logement construit avant le 1er janvier 1949",
    );
  if (hab && p === "travaux" && (pre49 || unk))
    add(
      "plomb",
      "Conseillé",
      "Protège occupants et artisans sur les peintures anciennes",
      "Plomb avant travaux",
    );

  if (hab && vl && !sais && a.elec !== "moins15")
    add(
      "electricite",
      has("elec") ? "Déjà valide" : a.elec === "plus15" ? "Obligatoire" : "À vérifier",
      "Installation électrique de plus de 15 ans",
    );
  if (hab && vl && !sais && a.gaz === "plus15")
    add("gaz", has("gaz") ? "Déjà valide" : "Obligatoire", "Installation gaz de plus de 15 ans");

  if (p === "vente" && a.copro === "oui")
    add("carrez", "Obligatoire", "Vente d’un lot de copropriété", "Mesurage loi Carrez");
  if (p === "location" && hab && !sais) {
    const meuble = a.loc === "meuble";
    add(
      "carrez",
      meuble ? "Conseillé" : "Obligatoire",
      meuble ? "Surface habitable à mentionner au bail" : "Surface habitable du logement loué vide",
      "Mesurage loi Boutin",
    );
  }
  if (p === "vente" && a.copro === "non" && hab)
    add("carrez", "Optionnel", "Surface habitable, utile pour l’annonce", "Mesurage de surface");

  if (p === "vente")
    add(
      "termites",
      "Obligatoire",
      commune?.cp.startsWith("83")
        ? `${commune.name} est classée zone termites par arrêté préfectoral`
        : "Tout le département des Bouches-du-Rhône est classé zone termites",
    );

  if (vl && !sais)
    add(
      "erp",
      "Obligatoire",
      commune?.peb
        ? "Inclut l’information bruit aéroport (ENSA) : commune couverte par un PEB"
        : "État des risques et pollutions, daté de moins de 6 mois",
    );

  if (p === "vente" && (t === "maison" || t === "immeuble") && a.copro !== "oui")
    add(
      "audit",
      a.classe === "efg" ? "Obligatoire" : a.classe === "ad" ? "Non requis" : "À vérifier",
      "Maison ou immeuble en monopropriété classé E, F ou G",
    );

  if (p === "vente" && t === "maison" && a.egout !== undefined && a.egout !== "oui")
    add("spanc", "Info", "Contrôle réalisé par le SPANC de la commune (moins de 3 ans)");

  return list;
}
