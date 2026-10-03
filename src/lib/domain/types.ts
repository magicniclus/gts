/**
 * Types du domaine (obligations et prix). Aucun import React, Next ni Firebase.
 */

export const BANDS = ["<30", "30-60", "60-100", "100-150", "150+"] as const;
export type Band = (typeof BANDS)[number];

export const PRICE_KEYS = [
  "dpe",
  "dpet",
  "amiante",
  "raat",
  "plomb",
  "electricite",
  "gaz",
  "carrez",
  "termites",
  "audit",
] as const;
export type PriceKey = (typeof PRICE_KEYS)[number];

export type Projet = "vente" | "location" | "travaux" | "autre";
export type TypeBien = "appartement" | "maison" | "local" | "immeuble";
export type Annee = "avant1949" | "1949-1997" | "1997-2012" | "apres2012" | "nsp";
export type Annexe = "cave" | "garage" | "parking" | "jardin" | "combles" | "piscine";
export type Deja = "dpe" | "amiante" | "plomb" | "elec" | "gaz";

/**
 * Réponses du formulaire utiles au calcul. Tous les champs sont facultatifs :
 * le formulaire calcule en direct, avant que toutes les questions aient une réponse.
 */
export type Answers = {
  projet?: Projet;
  loc?: "vide" | "meuble" | "saisonniere";
  nature?: "travaux" | "demolition";
  type?: TypeBien;
  surface?: Band;
  copro?: "oui" | "non";
  annee?: Annee;
  gaz?: "aucun" | "moins15" | "plus15";
  elec?: "moins15" | "plus15" | "nsp";
  annexes?: readonly Annexe[];
  egout?: "oui" | "non" | "nsp";
  classe?: "ad" | "efg" | "aucun" | "nsp";
  deja?: readonly Deja[];
};

/** Ce que le domaine a besoin de savoir d’une commune. */
export type CommuneInfo = {
  readonly name: string;
  readonly cp: string;
  readonly km: number;
  readonly peb: boolean;
};

export const LEVELS = [
  "Obligatoire",
  "À vérifier",
  "Conseillé",
  "Optionnel",
  "Déjà valide",
  "Non requis",
  "Info",
] as const;
export type Level = (typeof LEVELS)[number];

export type ObligationId =
  | "dpe"
  | "amiante"
  | "plomb"
  | "electricite"
  | "gaz"
  | "carrez"
  | "termites"
  | "erp"
  | "audit"
  | "spanc";

export type Obligation = {
  readonly id: ObligationId;
  /** Clé de la grille tarifaire, « erp » (offert) ou « spanc » (non chiffré). */
  readonly priceKey: PriceKey | "erp" | "spanc";
  readonly name: string;
  readonly level: Level;
  readonly reason: string;
};

export type PriceGrid = Record<PriceKey, readonly [number, number, number, number, number]>;

export type PricingRules = {
  /** Majoration maison, en %. */
  readonly maison: number;
  /** Supplément par annexe (hors piscine), en €. */
  readonly annexe: number;
  /** Remise pack, en %. */
  readonly packPct: number;
  /** Nombre de diagnostics payants à partir duquel la remise s’applique. */
  readonly packMin: number;
  /** Déplacement au-delà de 30 km, en €. */
  readonly d30: number;
  /** Déplacement au-delà de 40 km, en €. */
  readonly d40: number;
};

export type Pricing = {
  readonly grid: PriceGrid;
  readonly rules: PricingRules;
};

export type Row = Obligation & {
  /** Prix en € TTC ; 0 = offert ; null = sur devis (ou non chiffré pour le SPANC). */
  readonly price: number | null;
  /** Coché par le client. */
  readonly on: boolean;
};

export type Estimate = {
  readonly sub: number;
  readonly remise: number;
  readonly deplacement: number;
  readonly total: number;
  readonly surDevis: boolean;
  /** Remise pack appliquée. */
  readonly pack: boolean;
  /** Nombre de diagnostics payants retenus. */
  readonly paidCount: number;
};
