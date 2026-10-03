import type { DevisAnswers } from "@/lib/schemas/lead";

/** État du formulaire : réponses partielles + coordonnées. */
export type DevisForm = Partial<Omit<DevisAnswers, "annexes" | "deja">> & {
  annexes: NonNullable<DevisAnswers["annexes"]>;
  deja: NonNullable<DevisAnswers["deja"]>;
  profil: "particulier" | "agence" | "notaire" | "pro" | "";
  nom: string;
  tel: string;
  email: string;
  consent: boolean;
};

export const EMPTY_FORM: DevisForm = {
  annexes: [],
  deja: [],
  adresse: "",
  message: "",
  profil: "",
  nom: "",
  tel: "",
  email: "",
  consent: false,
};

export type SetField = <K extends keyof DevisForm>(key: K, value: DevisForm[K]) => void;

/** Une étape est valide quand ses réponses obligatoires sont données (maquette Devis). */
export function stepValidity(f: DevisForm): boolean[] {
  return [
    !!f.projet && (f.projet !== "location" || !!f.loc) && (f.projet !== "travaux" || !!f.nature),
    !!(f.type && f.commune && f.surface),
    !!f.annee,
    true,
    !!f.delai,
    !!(f.nom.trim() && f.tel.trim() && f.consent),
  ];
}
