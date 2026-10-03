/**
 * Textes des pages diagnostic et ville. Port de cityPage() et diagPage()
 * de docs/handoff/design/Diagnostic-Ville.dc.html, en fonctions pures.
 * Le prix « dès » est passé en paramètre (il vient du barème Firestore).
 */
import { COMMUNES, SECTEURS } from "../data/communes";
import { DIAGNOSTICS } from "../data/diagnostics";
import type { Commune, DiagnosticId, IconName } from "../data/types";
import { routes } from "./routes";
import { DESCRIPTION_MAX, TITLE_MAX, fitText } from "./seo-text";

export type LocalDiagnosticId = "dpe" | "amiante" | "plomb";
export const LOCAL_IDS: readonly LocalDiagnosticId[] = ["dpe", "amiante", "plomb"];

export type Fact = { icon: IconName; k: string; v: string };
export type NumberedBlock = { n: string; t: string; p: string };
export type Qa = { q: string; a: string };
export type Link = { name: string; href: string; icon?: IconName };
export type Crumb = { name: string; href?: string };

export type ContentPage = {
  label: string;
  icon: IconName;
  dname: string;
  crumbs: Crumb[];
  path: string;
  h1a: string;
  h1b: string;
  intro: string;
  cta: string;
  metaTitle: string;
  metaDesc: string;
  facts: Fact[];
  blocks: NumberedBlock[];
  faqTitle: string;
  faq: Qa[];
  relTitle: string;
  related: Link[];
  /** Communes voisines (page ville). */
  neighbors: Link[];
  /** Toutes les communes (page diagnostic décliné par ville). */
  communes: Link[];
  /** Lien vers le devis (pré-rempli avec la commune sur une page ville). */
  devisHref: string;
};

type Angle = "ancien" | "mixte" | "recent" | "littoral";

const ANGLE: Record<Commune["bati"], Angle> = {
  ancien: "ancien",
  mixte: "mixte",
  recent: "recent",
  littoral: "littoral",
  haussmann: "ancien",
  mrsmixte: "mixte",
  grandsens: "mixte",
};

/** Hash de la maquette : somme des codes de caractères du nom. */
export function nameHash(name: string): number {
  return [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function batiText(c: Commune): string {
  const n = c.name;
  return {
    ancien: `${n} conserve un bâti ancien : maisons de village, immeubles en pierre et nombreux logements antérieurs à 1949.`,
    mixte: `${n} mêle immeubles des années 1950-1970, résidences plus récentes et maisons individuelles.`,
    recent: `${n} s’est surtout développée à partir des années 1970, avec un habitat pavillonnaire et de petites résidences.`,
    littoral: `${n} associe villas de bord de mer, résidences de vacances et petit centre ancien, exposés au sel et au soleil.`,
    haussmann: `${n} concentre immeubles de rapport du XIXe siècle, trois-fenêtres marseillais et copropriétés anciennes.`,
    mrsmixte: `${n} alterne villas, noyaux villageois et résidences des années 1960 à 1990.`,
    grandsens: `${n} compte de grands ensembles des années 1960-1970, des noyaux villageois et des zones pavillonnaires.`,
  }[c.bati];
}

function angleText(id: LocalDiagnosticId, angle: Angle, n: string): string {
  const A: Record<LocalDiagnosticId, Record<Angle, string>> = {
    dpe: {
      ancien: `Murs épais en pierre, simple vitrage, toitures peu isolées : les biens anciens de ${n} peuvent perdre plusieurs classes, mais leur inertie joue en faveur du confort d’été, désormais pris en compte.`,
      mixte: `Les immeubles des Trente Glorieuses, rarement isolés à l’origine, se situent souvent entre D et F à ${n} ; chauffage collectif et menuiseries remplacées font la différence.`,
      recent: `Les maisons récentes de ${n} obtiennent en général C ou D ; pompe à chaleur, isolation des combles et orientation expliquent l’essentiel des écarts.`,
      littoral: `Sur le littoral de ${n}, climatisation et eau chaude pèsent lourd ; les résidences chauffées à l’électricité doivent soigner l’isolation pour rester louables après 2028.`,
    },
    amiante: {
      ancien: `Même dans le bâti ancien de ${n}, les rénovations des années 1960 à 1990 ont pu introduire de l’amiante : dalles de sol, conduits, colles de faïence.`,
      mixte: `Les résidences construites avant 1997 à ${n} sont directement concernées : dalles vinyle, conduits de vide-ordures, toitures et bardages en fibrociment.`,
      recent: `Une large part des maisons de ${n} a été bâtie entre 1970 et 1997 : le repérage cible surtout plaques ondulées des garages, conduits de cheminée et enduits.`,
      littoral: `Les villas de ${n} construites avant 1997 cachent souvent conduits et plaques en fibrociment, notamment sur les pool houses et dépendances.`,
    },
    plomb: {
      ancien: `Les logements d’avant 1949 sont nombreux à ${n} : volets, portes et ferronneries gardent fréquemment leurs peintures d’origine au plomb.`,
      mixte: `À ${n}, le CREP concerne surtout le noyau ancien et les immeubles d’avant-guerre ; les constructions postérieures à 1949 en sont exemptées.`,
      recent: `À ${n}, peu de logements datent d’avant 1949 : le CREP vise surtout les anciens mas, bastides et maisons du centre.`,
      littoral: `Les maisons de pêcheurs et le cœur ancien de ${n} sont concernés ; l’air salin accélère la dégradation des peintures anciennes.`,
    },
  };
  return A[id][angle];
}

function hooks(id: LocalDiagnosticId, n: string): readonly [string, string, string] {
  const H: Record<LocalDiagnosticId, readonly [string, string, string]> = {
    dpe: [
      `Vous vendez ou louez à ${n} ? Le DPE doit figurer dès l’annonce.`,
      `Le DPE conditionne la vente et la location de votre logement à ${n}.`,
      `Obtenez votre DPE à ${n} sous 48 h, rapport livré le lendemain.`,
    ],
    amiante: [
      `Votre bien à ${n} a été construit avant juillet 1997 ? Le constat amiante est obligatoire pour le vendre.`,
      `Vente, location ou travaux à ${n} : le repérage amiante protège acquéreur, occupants et artisans.`,
      `Repérage amiante à ${n} sous 48 h, prélèvements analysés en laboratoire accrédité.`,
    ],
    plomb: [
      `Logement d’avant 1949 à ${n} ? Le CREP est exigé à la vente comme à la location.`,
      `Le constat plomb mesure les peintures anciennes de votre logement à ${n}, sans aucun dégât.`,
      `CREP à ${n} réalisé à l’appareil à fluorescence X, rapport sous 24 h.`,
    ],
  };
  return H[id];
}

function distanceText(km: number): string {
  if (!km) return "au cœur de sa zone, sans frais de déplacement.";
  if (km <= 20) return `à ${km} km, sans frais de déplacement.`;
  if (km <= 35) return `à ${km} km, déplacement inclus.`;
  return `à ${km} km, en tournée plusieurs fois par semaine.`;
}

/** Délai de rendez-vous annoncé : 72 h au-delà de 35 km. */
export function rdvDelay(km: number): string {
  return km > 35 ? "Sous 72 h" : "Sous 48 h";
}

/** « 17 km » ou « Marseille » (liste des zones). */
export function kmLabel(c: Pick<Commune, "km">): string {
  return c.km ? `${c.km} km` : "Marseille";
}

/** Communes voisines : même secteur, triées par écart de distance, 8 au plus. */
export function neighborsOf(c: Commune, max = 8): Commune[] {
  return COMMUNES.filter((x) => x.secteur === c.secteur && x.slug !== c.slug)
    .sort((a, b) => Math.abs(a.km - c.km) - Math.abs(b.km - c.km))
    .slice(0, max);
}

export function isLocalDiagnostic(id: string): id is LocalDiagnosticId {
  return (LOCAL_IDS as readonly string[]).includes(id);
}

export function cityPage(c: Commune, id: LocalDiagnosticId, price: number): ContentPage {
  const d = DIAGNOSTICS[id];
  const n = c.name;
  const rdv = rdvDelay(c.km);
  const sect = SECTEURS[c.secteur];
  const intro = hooks(id, n)[nameHash(n) % 3] as string;
  return {
    label: "Page ville",
    icon: d.icon,
    dname: d.name,
    crumbs: [
      { name: "Accueil", href: routes.home() },
      { name: `Diagnostic ${d.name}`, href: routes.diagnostic(id) },
      { name: n },
    ],
    path: routes.city(id, c.slug),
    h1a: `Diagnostic ${d.name}`,
    h1b: `à ${n} (${c.cp})`,
    intro: `${intro} Guillaume Tilliet, diagnostiqueur certifié basé à Marseille, intervient à ${n} ${distanceText(c.km)}`,
    cta: `Devis ${d.name} à ${n}`,
    metaTitle: fitText(
      [
        `Diagnostic ${d.name} ${n} (${c.cp}) dès ${price} € | GTS Diagnostic`,
        `Diagnostic ${d.name} ${n} (${c.cp}) dès ${price} €`,
        `Diagnostic ${d.name} ${n} (${c.cp})`,
        `${d.name} ${n} (${c.cp})`,
      ],
      TITLE_MAX,
    ),
    metaDesc: fitText(
      [
        `${d.long} à ${n} : rendez-vous ${rdv.toLowerCase()}, rapport sous 24 h, diagnostiqueur certifié indépendant. Devis gratuit en 2 minutes.`,
        `Diagnostic ${d.name} à ${n} : rendez-vous ${rdv.toLowerCase()}, rapport sous 24 h, diagnostiqueur certifié indépendant. Devis gratuit en 2 minutes.`,
        `Diagnostic ${d.name} à ${n} : rendez-vous ${rdv.toLowerCase()}, rapport sous 24 h, diagnostiqueur certifié. Devis gratuit en 2 minutes.`,
      ],
      DESCRIPTION_MAX,
    ),
    facts: [
      {
        icon: "map-pin",
        k: "Distance",
        v: c.km ? `${c.km} km de Marseille` : "Marseille intra-muros",
      },
      { icon: "calendar-check", k: "Rendez-vous", v: rdv },
      { icon: "tag", k: "Tarif", v: `Dès ${price} € TTC` },
      { icon: "compass", k: "Secteur", v: sect },
    ],
    blocks: [
      {
        n: "01",
        t: `Le bâti à ${n}`,
        p: `${batiText(c)} ${angleText(id, ANGLE[c.bati], n)}`,
      },
      {
        n: "02",
        t: `Quand le diagnostic ${d.name} est-il exigé ?`,
        p: d.blocks[0][1],
      },
      {
        n: "03",
        t: `Délais et tarif à ${n}`,
        p: `Rendez-vous ${rdv.toLowerCase()}, samedi matin compris. Rapport transmis sous 24 h par e-mail${id === "dpe" ? " et enregistré auprès de l’ADEME" : ""}. Tarif dès ${price} € pour un appartement, devis ferme avant intervention et remise dès trois diagnostics.`,
      },
    ],
    faqTitle: `Questions fréquentes à ${n}`,
    faq: [
      {
        q: `Le diagnostic ${d.name} est-il obligatoire à ${n} ?`,
        a: `${d.when} : les règles sont nationales et s’appliquent à ${n} comme partout. ${d.faq[0][1]}`,
      },
      {
        q: `Quel délai pour un rendez-vous à ${n} ?`,
        a: `${rdv} en général. ${n} fait partie du secteur « ${sect} » couvert chaque semaine.`,
      },
      { q: d.faq[1][0], a: d.faq[1][1] },
    ],
    relTitle: `Autres diagnostics à ${n}`,
    related: LOCAL_IDS.filter((k) => k !== id).map((k) => ({
      name: `Diagnostic ${DIAGNOSTICS[k].name} à ${n}`,
      icon: DIAGNOSTICS[k].icon,
      href: routes.city(k, c.slug),
    })),
    neighbors: neighborsOf(c).map((x) => ({
      name: x.name,
      href: routes.city(id, x.slug),
    })),
    communes: [],
    devisHref: routes.devis(c.slug),
  };
}

/** `price` : prix « dès » (0 = offert, pour l’ERP). */
export function diagPage(id: DiagnosticId, price: number): ContentPage {
  const d = DIAGNOSTICS[id];
  const ids = Object.keys(DIAGNOSTICS) as DiagnosticId[];
  const from = price ? `dès ${price} € ` : "";
  return {
    label: "Diagnostic",
    icon: d.icon,
    dname: d.name,
    crumbs: [{ name: "Accueil", href: routes.home() }, { name: d.name }],
    path: routes.diagnostic(id),
    h1a: d.local ? `Diagnostic ${d.name}` : d.long,
    h1b: "à Marseille",
    intro: d.lead,
    cta: `Devis ${d.name} gratuit`,
    metaTitle: fitText(
      [
        `Diagnostic ${d.name} Marseille ${from}| GTS Diagnostic`,
        `Diagnostic ${d.name} Marseille ${from}`.trim(),
        `Diagnostic ${d.name} à Marseille`,
      ],
      TITLE_MAX,
    ),
    metaDesc: fitText(
      [
        `${d.long} à Marseille et 50 km autour. ${d.when}. Diagnostiqueur certifié indépendant, rapport sous 24 h.`,
        `${d.long} à Marseille et 50 km autour. ${d.when}. Diagnostiqueur certifié, rapport sous 24 h.`,
        `Diagnostic ${d.name} à Marseille et 50 km autour. ${d.when}. Diagnostiqueur certifié, rapport sous 24 h.`,
      ],
      DESCRIPTION_MAX,
    ),
    facts: [
      { icon: "scales", k: "Obligatoire", v: d.when },
      { icon: "hourglass", k: "Validité", v: d.valid },
      { icon: "tag", k: "Tarif", v: price ? `Dès ${price} € TTC` : "Offert" },
      { icon: "file-text", k: "Rapport", v: "Sous 24 h" },
    ],
    blocks: d.blocks.map(([t, p], i) => ({ n: `0${i + 1}`, t, p })),
    faqTitle: `Questions sur le diagnostic ${d.name}`,
    faq: d.faq.map(([q, a]) => ({ q, a })),
    relTitle: "Les autres diagnostics",
    related: ids
      .filter((k) => k !== id)
      .map((k) => ({
        name: DIAGNOSTICS[k].long,
        icon: DIAGNOSTICS[k].icon,
        href: routes.diagnostic(k),
      })),
    neighbors: [],
    communes: d.local ? COMMUNES.map((c) => ({ name: c.name, href: routes.city(id, c.slug) })) : [],
    devisHref: routes.devis(),
  };
}
