/**
 * Options du formulaire de devis : objet `L` de renderVals() dans
 * docs/handoff/design/Devis.dc.html (valeurs, libellés, icônes, indications).
 */
import type { IconName } from "./types";

export type DevisOption<V extends string = string> = {
  readonly value: V;
  readonly label: string;
  readonly icon?: IconName;
  readonly hint?: string;
  /** Libellé court (tuiles de la carte du hero). */
  readonly short?: string;
};

const opts = <V extends string>(list: readonly DevisOption<V>[]) => list;

export const PROJET = opts([
  {
    value: "vente",
    label: "Je vends mon bien",
    icon: "key",
    hint: "Maison, appartement, local",
    short: "Je vends",
  },
  {
    value: "location",
    label: "Je mets en location",
    icon: "house-line",
    hint: "Bail vide ou meublé",
    short: "Je loue",
  },
  {
    value: "travaux",
    label: "Travaux ou démolition",
    icon: "hammer",
    hint: "Repérage avant chantier",
    short: "Travaux",
  },
  {
    value: "autre",
    label: "Autre besoin",
    icon: "question",
    hint: "Audit, conseil, contrôle",
    short: "Autre",
  },
] as const);

export const TYPE = opts([
  { value: "appartement", label: "Appartement", icon: "buildings" },
  { value: "maison", label: "Maison", icon: "house" },
  { value: "local", label: "Local pro", icon: "storefront" },
  { value: "immeuble", label: "Immeuble", icon: "building-office" },
] as const);

export const SURFACE = opts([
  { value: "<30", label: "< 30 m²" },
  { value: "30-60", label: "30 – 60 m²" },
  { value: "60-100", label: "60 – 100 m²" },
  { value: "100-150", label: "100 – 150 m²" },
  { value: "150+", label: "> 150 m²" },
] as const);

export const PIECES = opts([
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6+", label: "6+" },
] as const);

export const COPRO = opts([
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
] as const);

export const ANNEE = opts([
  { value: "avant1949", label: "Avant 1949", hint: "Amiante + plomb" },
  { value: "1949-1997", label: "1949 – juin 1997", hint: "Amiante" },
  {
    value: "1997-2012",
    label: "Juil. 1997 – 2012",
    hint: "Ni amiante ni plomb",
  },
  { value: "apres2012", label: "Après 2012", hint: "Bâti récent" },
  { value: "nsp", label: "Je ne sais pas", hint: "On vérifie ensemble" },
] as const);

export const GAZ = opts([
  { value: "aucun", label: "Pas de gaz" },
  { value: "moins15", label: "Moins de 15 ans" },
  { value: "plus15", label: "Plus de 15 ans" },
] as const);

export const ELEC = opts([
  { value: "moins15", label: "Moins de 15 ans" },
  { value: "plus15", label: "Plus de 15 ans" },
  { value: "nsp", label: "Je ne sais pas" },
] as const);

export const CHAUFFAGE = opts([
  { value: "elec", label: "Électrique", icon: "lightning" },
  { value: "gaz", label: "Gaz", icon: "fire" },
  { value: "pac", label: "Pompe à chaleur", icon: "fan" },
  { value: "fioul", label: "Fioul", icon: "drop" },
  { value: "bois", label: "Bois", icon: "tree" },
  { value: "collectif", label: "Collectif", icon: "buildings" },
] as const);

export const ANNEXES = opts([
  { value: "cave", label: "Cave", icon: "stairs" },
  { value: "garage", label: "Garage", icon: "garage" },
  { value: "parking", label: "Parking", icon: "car" },
  { value: "jardin", label: "Jardin", icon: "plant" },
  { value: "combles", label: "Combles", icon: "house-simple" },
  { value: "piscine", label: "Piscine", icon: "swimming-pool" },
] as const);

export const DELAI = opts([
  { value: "48h", label: "Au plus vite", icon: "lightning" },
  { value: "semaine", label: "Cette semaine", icon: "calendar" },
  { value: "15j", label: "Sous 15 jours", icon: "calendar-blank" },
  { value: "flexible", label: "Flexible", icon: "clock" },
] as const);

export const CRENEAU = opts([
  { value: "matin", label: "Matin" },
  { value: "apresmidi", label: "Après-midi" },
  { value: "samedi", label: "Samedi matin" },
] as const);

export const ACCES = opts([
  { value: "present", label: "Je serai présent", icon: "user" },
  { value: "cles", label: "Clés en agence / notaire", icon: "key" },
  { value: "locataire", label: "Locataire en place", icon: "users" },
] as const);

export const LOC = opts([
  { value: "vide", label: "Location vide" },
  { value: "meuble", label: "Meublée" },
  { value: "saisonniere", label: "Saisonnière / tourisme" },
] as const);

export const NATURE = opts([
  { value: "travaux", label: "Travaux / rénovation" },
  { value: "demolition", label: "Démolition" },
] as const);

export const EGOUT = opts([
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non, fosse septique" },
  { value: "nsp", label: "Je ne sais pas" },
] as const);

export const CLASSE = opts([
  { value: "ad", label: "Classé A à D" },
  { value: "efg", label: "Classé E, F ou G" },
  { value: "aucun", label: "Pas de DPE récent" },
  { value: "nsp", label: "Je ne sais pas" },
] as const);

export const DEJA = opts([
  { value: "dpe", label: "DPE après juil. 2021", icon: "lightning" },
  {
    value: "amiante",
    label: "Amiante négatif après 2013",
    icon: "warning-diamond",
  },
  { value: "plomb", label: "CREP sans plomb", icon: "paint-roller" },
  { value: "elec", label: "Électricité encore valide", icon: "plug" },
  { value: "gaz", label: "Gaz encore valide", icon: "fire" },
] as const);

export const PROFIL = opts([
  { value: "particulier", label: "Particulier" },
  { value: "agence", label: "Agence immobilière" },
  { value: "notaire", label: "Notaire" },
  { value: "pro", label: "Syndic / pro" },
] as const);

export const DEVIS_OPTIONS = {
  projet: PROJET,
  type: TYPE,
  surface: SURFACE,
  pieces: PIECES,
  copro: COPRO,
  annee: ANNEE,
  gaz: GAZ,
  elec: ELEC,
  chauffage: CHAUFFAGE,
  annexes: ANNEXES,
  delai: DELAI,
  creneau: CRENEAU,
  acces: ACCES,
  loc: LOC,
  nature: NATURE,
  egout: EGOUT,
  classe: CLASSE,
  deja: DEJA,
  profil: PROFIL,
} as const;

export type DevisOptionKey = keyof typeof DEVIS_OPTIONS;
export type OptionValue<K extends DevisOptionKey> =
  (typeof DEVIS_OPTIONS)[K][number]["value"];

/** Libellé d’une valeur, ou undefined si la valeur est absente ou inconnue. */
export function optionLabel<K extends DevisOptionKey>(
  key: K,
  value: string | undefined,
): string | undefined {
  const list: readonly DevisOption[] = DEVIS_OPTIONS[key];
  return list.find((o) => o.value === value)?.label;
}

/** Étapes du formulaire. */
export const DEVIS_STEPS = [
  "Projet",
  "Le bien",
  "Construction",
  "Diagnostics",
  "Rendez-vous",
  "Coordonnées",
] as const;
