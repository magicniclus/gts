import type { SubmitLeadInput } from "@/lib/schemas/lead";

/** Demande valide : cas A (vente, appartement d’avant 1949, Marseille 8e). */
export const VALID_LEAD: SubmitLeadInput = {
  answers: {
    projet: "vente",
    type: "appartement",
    commune: "marseille-8e",
    adresse: "",
    surface: "30-60",
    copro: "oui",
    annee: "avant1949",
    gaz: "plus15",
    elec: "plus15",
    annexes: [],
    deja: [],
    delai: "semaine",
    message: "",
  },
  contact: {
    profil: "particulier",
    nom: "Sophie Marchetti",
    tel: "06 21 44 87 10",
    email: "s.m@exemple.fr",
  },
  checked: ["dpe", "amiante", "plomb", "electricite", "gaz", "carrez", "termites", "erp"],
  consent: true,
  website: "",
};
