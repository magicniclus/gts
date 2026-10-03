export type SecteurId =
  "mrs" | "est" | "nord" | "aix" | "sud" | "ouest" | "var";

export type Bati =
  | "ancien"
  | "mixte"
  | "recent"
  | "littoral"
  | "haussmann"
  | "mrsmixte"
  | "grandsens";

export type Commune = {
  readonly name: string;
  readonly cp: string;
  /** Distance depuis Marseille, en km (0 pour les arrondissements). */
  readonly km: number;
  readonly secteur: SecteurId;
  readonly bati: Bati;
  readonly slug: string;
  /** Commune couverte par un plan d’exposition au bruit (aéroport). */
  readonly peb: boolean;
};

export type DiagnosticId =
  | "dpe"
  | "amiante"
  | "plomb"
  | "electricite"
  | "gaz"
  | "carrez"
  | "termites"
  | "erp"
  | "audit";

/** Nom d’icône Phosphor en kebab-case, sans préfixe « ph- ». */
export type IconName = string;

export type DiagnosticContent = {
  readonly name: string;
  readonly long: string;
  readonly icon: IconName;
  /** Prix « dès » indicatif ; le vrai prix vient de settings/pricing. */
  readonly price: number;
  readonly valid: string;
  readonly when: string;
  /** Décliné en pages ville (DPE, amiante, plomb). */
  readonly local: boolean;
  readonly lead: string;
  readonly blocks: readonly (readonly [string, string])[];
  readonly faq: readonly (readonly [string, string])[];
};
