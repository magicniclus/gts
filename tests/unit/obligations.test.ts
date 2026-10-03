import { describe, expect, it } from "vitest";
import {
  diagList,
  isDefaultChecked,
  isSelectable,
} from "@/lib/domain/obligations";
import type {
  Answers,
  CommuneInfo,
  Level,
  Obligation,
} from "@/lib/domain/types";

const marseille8: CommuneInfo = {
  name: "Marseille 8e",
  cp: "13008",
  km: 0,
  peb: false,
};
const istres: CommuneInfo = { name: "Istres", cp: "13800", km: 45, peb: true };
const bandol: CommuneInfo = { name: "Bandol", cp: "83150", km: 45, peb: false };

const venteAppart: Answers = {
  projet: "vente",
  type: "appartement",
  surface: "30-60",
  annee: "avant1949",
  copro: "oui",
  elec: "plus15",
  gaz: "plus15",
};

const byId = (list: Obligation[]) =>
  Object.fromEntries(list.map((o) => [o.id, o]));
const levels = (list: Obligation[]) =>
  Object.fromEntries(list.map((o) => [o.id, o.level]));

describe("diagList : une ligne par règle du tableau §2", () => {
  type Case = {
    title: string;
    a: Answers;
    c?: CommuneInfo;
    id: Obligation["id"];
    level?: Level;
    name?: string;
    pk?: string;
    reason?: RegExp;
  };
  const cases: Case[] = [
    // DPE
    {
      title: "DPE vente → Obligatoire",
      a: { projet: "vente", type: "appartement" },
      id: "dpe",
      level: "Obligatoire",
      name: "Diagnostic de performance énergétique",
      pk: "dpe",
      reason: /Vente ou location d’un logement/,
    },
    {
      title: "DPE location → Obligatoire",
      a: { projet: "location", loc: "vide", type: "maison" },
      id: "dpe",
      level: "Obligatoire",
    },
    {
      title: "DPE déjà valide",
      a: { projet: "vente", type: "appartement", deja: ["dpe"] },
      id: "dpe",
      level: "Déjà valide",
      reason: /après le 1er juillet 2021/,
    },
    {
      title: "DPE saisonnier → motif meublé de tourisme",
      a: { projet: "location", loc: "saisonniere", type: "appartement" },
      id: "dpe",
      level: "Obligatoire",
      reason: /meublé de tourisme/,
    },
    {
      title: "DPE local pro → dpet",
      a: { projet: "vente", type: "local" },
      id: "dpe",
      level: "Obligatoire",
      name: "DPE tertiaire",
      pk: "dpet",
      reason: /local professionnel/,
    },
    {
      title: "DPE autre besoin → Optionnel",
      a: { projet: "autre", type: "maison" },
      id: "dpe",
      level: "Optionnel",
      pk: "dpe",
    },
    // Amiante avant travaux
    {
      title: "RAAT travaux avant 1997",
      a: { projet: "travaux", nature: "travaux", annee: "1949-1997" },
      id: "amiante",
      level: "Obligatoire",
      name: "Amiante avant travaux",
      pk: "raat",
      reason: /RAAT/,
    },
    {
      title: "RAAT démolition",
      a: { projet: "travaux", nature: "demolition", annee: "avant1949" },
      id: "amiante",
      level: "Obligatoire",
      name: "Amiante avant démolition",
      pk: "raat",
      reason: /démolition/,
    },
    {
      title: "RAAT année inconnue → À vérifier",
      a: { projet: "travaux", nature: "travaux", annee: "nsp" },
      id: "amiante",
      level: "À vérifier",
      pk: "raat",
    },
    // Amiante vente
    {
      title: "Amiante vente avant 1997",
      a: { projet: "vente", type: "maison", annee: "1949-1997" },
      id: "amiante",
      level: "Obligatoire",
      name: "Constat de repérage amiante",
      pk: "amiante",
    },
    {
      title: "Amiante vente année non renseignée → À vérifier",
      a: { projet: "vente", type: "maison" },
      id: "amiante",
      level: "À vérifier",
    },
    {
      title: "Amiante vente déjà valide",
      a: {
        projet: "vente",
        type: "maison",
        annee: "avant1949",
        deja: ["amiante"],
      },
      id: "amiante",
      level: "Déjà valide",
      reason: /1er avril 2013/,
    },
    // Amiante DAPP
    {
      title: "DAPP location appartement",
      a: {
        projet: "location",
        loc: "vide",
        type: "appartement",
        annee: "1949-1997",
      },
      id: "amiante",
      level: "Obligatoire",
      name: "Amiante (DAPP)",
      pk: "amiante",
      reason: /DAPP/,
    },
    {
      title: "DAPP maison en copropriété",
      a: {
        projet: "location",
        loc: "meuble",
        type: "maison",
        copro: "oui",
        annee: "avant1949",
      },
      id: "amiante",
      level: "Obligatoire",
    },
    {
      title: "DAPP année inconnue → À vérifier",
      a: { projet: "location", loc: "vide", type: "appartement", annee: "nsp" },
      id: "amiante",
      level: "À vérifier",
    },
    {
      title: "DAPP déjà valide",
      a: {
        projet: "location",
        loc: "vide",
        type: "appartement",
        annee: "avant1949",
        deja: ["amiante"],
      },
      id: "amiante",
      level: "Déjà valide",
    },
    // Plomb
    {
      title: "CREP vente avant 1949",
      a: { projet: "vente", type: "appartement", annee: "avant1949" },
      id: "plomb",
      level: "Obligatoire",
      name: "Constat de risque d’exposition au plomb (CREP)",
      pk: "plomb",
    },
    {
      title: "CREP location année inconnue → À vérifier",
      a: { projet: "location", loc: "vide", type: "appartement", annee: "nsp" },
      id: "plomb",
      level: "À vérifier",
    },
    {
      title: "CREP déjà valide",
      a: {
        projet: "vente",
        type: "maison",
        annee: "avant1949",
        deja: ["plomb"],
      },
      id: "plomb",
      level: "Déjà valide",
    },
    {
      title: "Plomb avant travaux → Conseillé",
      a: {
        projet: "travaux",
        nature: "travaux",
        type: "maison",
        annee: "avant1949",
      },
      id: "plomb",
      level: "Conseillé",
      name: "Plomb avant travaux",
      pk: "plomb",
    },
    // Électricité
    {
      title: "Électricité +15 ans → Obligatoire",
      a: { projet: "vente", type: "appartement", elec: "plus15" },
      id: "electricite",
      level: "Obligatoire",
      name: "Diagnostic électricité",
      pk: "electricite",
    },
    {
      title: "Électricité nsp → À vérifier",
      a: { projet: "vente", type: "appartement", elec: "nsp" },
      id: "electricite",
      level: "À vérifier",
    },
    {
      title: "Électricité non renseignée → À vérifier",
      a: { projet: "location", loc: "vide", type: "appartement" },
      id: "electricite",
      level: "À vérifier",
    },
    {
      title: "Électricité déjà valide",
      a: {
        projet: "vente",
        type: "appartement",
        elec: "plus15",
        deja: ["elec"],
      },
      id: "electricite",
      level: "Déjà valide",
    },
    // Gaz
    {
      title: "Gaz +15 ans → Obligatoire",
      a: { projet: "vente", type: "maison", gaz: "plus15" },
      id: "gaz",
      level: "Obligatoire",
      name: "Diagnostic gaz",
      pk: "gaz",
    },
    {
      title: "Gaz déjà valide",
      a: {
        projet: "location",
        loc: "vide",
        type: "maison",
        gaz: "plus15",
        deja: ["gaz"],
      },
      id: "gaz",
      level: "Déjà valide",
    },
    // Mesurages
    {
      title: "Carrez vente en copropriété",
      a: { projet: "vente", type: "appartement", copro: "oui" },
      id: "carrez",
      level: "Obligatoire",
      name: "Mesurage loi Carrez",
      pk: "carrez",
    },
    {
      title: "Carrez vente d’un local en copropriété",
      a: { projet: "vente", type: "local", copro: "oui" },
      id: "carrez",
      level: "Obligatoire",
    },
    {
      title: "Boutin location vide → Obligatoire",
      a: { projet: "location", loc: "vide", type: "appartement" },
      id: "carrez",
      level: "Obligatoire",
      name: "Mesurage loi Boutin",
      pk: "carrez",
      reason: /loué vide/,
    },
    {
      title: "Boutin meublé → Conseillé",
      a: { projet: "location", loc: "meuble", type: "appartement" },
      id: "carrez",
      level: "Conseillé",
      reason: /bail/,
    },
    {
      title: "Mesurage hors copropriété → Optionnel",
      a: { projet: "vente", type: "maison", copro: "non" },
      id: "carrez",
      level: "Optionnel",
      name: "Mesurage de surface",
    },
    // Termites
    {
      title: "Termites vente (13)",
      a: { projet: "vente", type: "maison" },
      c: marseille8,
      id: "termites",
      level: "Obligatoire",
      name: "État relatif à la présence de termites",
      reason: /Bouches-du-Rhône/,
    },
    {
      title: "Termites vente (Var)",
      a: { projet: "vente", type: "maison" },
      c: bandol,
      id: "termites",
      level: "Obligatoire",
      reason: /Bandol est classée zone termites/,
    },
    {
      title: "Termites sans commune",
      a: { projet: "vente", type: "maison" },
      id: "termites",
      level: "Obligatoire",
      reason: /Bouches-du-Rhône/,
    },
    // ERP
    {
      title: "ERP vente",
      a: { projet: "vente", type: "maison" },
      c: marseille8,
      id: "erp",
      level: "Obligatoire",
      name: "État des risques et pollutions",
      pk: "erp",
      reason: /moins de 6 mois/,
    },
    {
      title: "ERP commune PEB → ENSA",
      a: { projet: "location", loc: "vide", type: "maison" },
      c: istres,
      id: "erp",
      level: "Obligatoire",
      reason: /bruit aéroport \(ENSA\)/,
    },
    // Audit
    {
      title: "Audit maison EFG → Obligatoire",
      a: { projet: "vente", type: "maison", classe: "efg" },
      id: "audit",
      level: "Obligatoire",
      name: "Audit énergétique réglementaire",
      pk: "audit",
    },
    {
      title: "Audit maison A–D → Non requis",
      a: { projet: "vente", type: "maison", classe: "ad" },
      id: "audit",
      level: "Non requis",
    },
    {
      title: "Audit immeuble sans classe → À vérifier",
      a: { projet: "vente", type: "immeuble", copro: "non" },
      id: "audit",
      level: "À vérifier",
    },
    {
      title: "Audit classe nsp → À vérifier",
      a: { projet: "vente", type: "maison", classe: "nsp" },
      id: "audit",
      level: "À vérifier",
    },
    // SPANC
    {
      title: "SPANC maison en fosse septique → Info",
      a: { projet: "vente", type: "maison", egout: "non" },
      id: "spanc",
      level: "Info",
      name: "Assainissement non collectif",
      pk: "spanc",
      reason: /SPANC/,
    },
    {
      title: "SPANC égout inconnu → Info",
      a: { projet: "vente", type: "maison", egout: "nsp" },
      id: "spanc",
      level: "Info",
    },
  ];

  it.each(cases)("$title", ({ a, c, id, level, name, pk, reason }) => {
    const o = byId(diagList(a, c))[id];
    expect(o, `ligne ${id} absente`).toBeDefined();
    if (level) expect(o?.level).toBe(level);
    if (name) expect(o?.name).toBe(name);
    if (pk) expect(o?.priceKey).toBe(pk);
    if (reason) expect(o?.reason).toMatch(reason);
  });

  type Absent = { title: string; a: Answers; id: Obligation["id"] };
  const absents: Absent[] = [
    {
      title: "pas de DPE pour des travaux",
      a: { projet: "travaux", nature: "travaux" },
      id: "dpe",
    },
    {
      title: "pas d’amiante après 1997 (vente)",
      a: { projet: "vente", type: "maison", annee: "1997-2012" },
      id: "amiante",
    },
    {
      title: "pas de RAAT après 1997",
      a: { projet: "travaux", nature: "travaux", annee: "apres2012" },
      id: "amiante",
    },
    {
      title: "pas de DAPP pour une maison hors copropriété",
      a: {
        projet: "location",
        loc: "vide",
        type: "maison",
        copro: "non",
        annee: "avant1949",
      },
      id: "amiante",
    },
    {
      title: "pas de DAPP pour un local",
      a: {
        projet: "location",
        loc: "vide",
        type: "local",
        copro: "oui",
        annee: "avant1949",
      },
      id: "amiante",
    },
    {
      title: "pas de DAPP en saisonnier",
      a: {
        projet: "location",
        loc: "saisonniere",
        type: "appartement",
        annee: "avant1949",
      },
      id: "amiante",
    },
    {
      title: "pas d’amiante pour « autre »",
      a: { projet: "autre", annee: "avant1949" },
      id: "amiante",
    },
    {
      title: "pas de plomb après 1949",
      a: { projet: "vente", type: "appartement", annee: "1949-1997" },
      id: "plomb",
    },
    {
      title: "pas de plomb pour un local",
      a: { projet: "vente", type: "local", annee: "avant1949" },
      id: "plomb",
    },
    {
      title: "pas de plomb en saisonnier",
      a: {
        projet: "location",
        loc: "saisonniere",
        type: "appartement",
        annee: "avant1949",
      },
      id: "plomb",
    },
    {
      title: "pas de plomb avant travaux après 1949",
      a: { projet: "travaux", type: "maison", annee: "1949-1997" },
      id: "plomb",
    },
    {
      title: "pas d’électricité de moins de 15 ans",
      a: { projet: "vente", type: "maison", elec: "moins15" },
      id: "electricite",
    },
    {
      title: "pas d’électricité pour un local",
      a: { projet: "vente", type: "local", elec: "plus15" },
      id: "electricite",
    },
    {
      title: "pas d’électricité en saisonnier",
      a: {
        projet: "location",
        loc: "saisonniere",
        type: "appartement",
        elec: "plus15",
      },
      id: "electricite",
    },
    {
      title: "pas d’électricité pour des travaux",
      a: { projet: "travaux", type: "maison", elec: "plus15" },
      id: "electricite",
    },
    {
      title: "pas de gaz sans installation",
      a: { projet: "vente", type: "maison", gaz: "aucun" },
      id: "gaz",
    },
    {
      title: "pas de gaz de moins de 15 ans",
      a: { projet: "vente", type: "maison", gaz: "moins15" },
      id: "gaz",
    },
    {
      title: "pas de gaz non renseigné",
      a: { projet: "vente", type: "maison" },
      id: "gaz",
    },
    {
      title: "pas de mesurage pour un local hors copropriété",
      a: { projet: "vente", type: "local", copro: "non" },
      id: "carrez",
    },
    {
      title: "pas de mesurage si copropriété non renseignée",
      a: { projet: "vente", type: "maison" },
      id: "carrez",
    },
    {
      title: "pas de Boutin pour un local",
      a: { projet: "location", loc: "vide", type: "local" },
      id: "carrez",
    },
    {
      title: "pas de Boutin en saisonnier",
      a: { projet: "location", loc: "saisonniere", type: "appartement" },
      id: "carrez",
    },
    {
      title: "pas de termites en location",
      a: { projet: "location", loc: "vide", type: "maison" },
      id: "termites",
    },
    {
      title: "pas d’ERP en saisonnier",
      a: { projet: "location", loc: "saisonniere", type: "appartement" },
      id: "erp",
    },
    {
      title: "pas d’ERP pour des travaux",
      a: { projet: "travaux" },
      id: "erp",
    },
    {
      title: "pas d’audit pour un appartement",
      a: { projet: "vente", type: "appartement", classe: "efg" },
      id: "audit",
    },
    {
      title: "pas d’audit en copropriété",
      a: { projet: "vente", type: "maison", copro: "oui", classe: "efg" },
      id: "audit",
    },
    {
      title: "pas d’audit en location",
      a: { projet: "location", loc: "vide", type: "maison", classe: "efg" },
      id: "audit",
    },
    {
      title: "pas de SPANC au tout-à-l’égout",
      a: { projet: "vente", type: "maison", egout: "oui" },
      id: "spanc",
    },
    {
      title: "pas de SPANC si non renseigné",
      a: { projet: "vente", type: "maison" },
      id: "spanc",
    },
    {
      title: "pas de SPANC pour un immeuble",
      a: { projet: "vente", type: "immeuble", egout: "non" },
      id: "spanc",
    },
  ];

  it.each(absents)("$title", ({ a, id }) => {
    expect(byId(diagList(a))[id]).toBeUndefined();
  });

  it("ne renvoie rien sans projet", () => {
    expect(diagList({})).toEqual([]);
  });
});

describe("diagList : cas A à J", () => {
  it("A : vente d’un appartement d’avant 1949 en copropriété", () => {
    const l = diagList(venteAppart, marseille8);
    expect(l.map((o) => o.id)).toEqual([
      "dpe",
      "amiante",
      "plomb",
      "electricite",
      "gaz",
      "carrez",
      "termites",
      "erp",
    ]);
    expect(Object.values(levels(l)).every((lv) => lv === "Obligatoire")).toBe(
      true,
    );
  });

  it("B : vente d’une maison 1949–1997, classée EFG, au tout-à-l’égout", () => {
    const a: Answers = {
      projet: "vente",
      type: "maison",
      surface: "100-150",
      annee: "1949-1997",
      copro: "non",
      elec: "plus15",
      gaz: "aucun",
      annexes: ["garage", "piscine"],
      classe: "efg",
      egout: "oui",
    };
    const l = diagList(a, { name: "Aubagne", cp: "13400", km: 17, peb: false });
    expect(levels(l)).toEqual({
      dpe: "Obligatoire",
      amiante: "Obligatoire",
      electricite: "Obligatoire",
      carrez: "Optionnel",
      termites: "Obligatoire",
      erp: "Obligatoire",
      audit: "Obligatoire",
    });
  });

  it("D : Istres, motif ERP « bruit aéroport »", () => {
    expect(byId(diagList(venteAppart, istres)).erp?.reason).toMatch(
      /bruit aéroport/,
    );
  });

  it("E : immeuble entier d’avant 1949", () => {
    const l = diagList({
      projet: "vente",
      type: "immeuble",
      surface: "150+",
      annee: "avant1949",
    });
    expect(l.map((o) => o.id)).toEqual([
      "dpe",
      "amiante",
      "plomb",
      "electricite",
      "termites",
      "erp",
      "audit",
    ]);
  });

  it("F : location vide d’un appartement 1949–1997", () => {
    const a: Answers = {
      projet: "location",
      loc: "vide",
      type: "appartement",
      surface: "30-60",
      annee: "1949-1997",
      copro: "oui",
      elec: "moins15",
      gaz: "aucun",
    };
    const l = diagList(a, {
      name: "Marseille 1er",
      cp: "13001",
      km: 0,
      peb: false,
    });
    expect(l.map((o) => [o.id, o.name, o.level])).toEqual([
      ["dpe", "Diagnostic de performance énergétique", "Obligatoire"],
      ["amiante", "Amiante (DAPP)", "Obligatoire"],
      ["carrez", "Mesurage loi Boutin", "Obligatoire"],
      ["erp", "État des risques et pollutions", "Obligatoire"],
    ]);
  });

  it("G : location saisonnière, DPE seul", () => {
    const l = diagList({
      projet: "location",
      loc: "saisonniere",
      type: "appartement",
      surface: "30-60",
      annee: "avant1949",
    });
    expect(l).toHaveLength(1);
    expect(l[0]?.id).toBe("dpe");
    expect(l[0]?.reason).toMatch(/meublé de tourisme/);
  });

  it("H : DPE déjà valide", () => {
    expect(levels(diagList({ ...venteAppart, deja: ["dpe"] })).dpe).toBe(
      "Déjà valide",
    );
  });

  it("I : année inconnue → amiante, plomb et électricité à vérifier", () => {
    const l = levels(
      diagList({
        projet: "vente",
        type: "appartement",
        surface: "30-60",
        annee: "nsp",
        copro: "oui",
        elec: "nsp",
      }),
    );
    expect(l.amiante).toBe("À vérifier");
    expect(l.plomb).toBe("À vérifier");
    expect(l.electricite).toBe("À vérifier");
  });
});

describe("cases cochées par défaut", () => {
  it.each([
    ["Obligatoire", true],
    ["À vérifier", true],
    ["Conseillé", false],
    ["Optionnel", false],
    ["Déjà valide", false],
    ["Non requis", false],
    ["Info", false],
  ] as const)("%s → %s", (level, checked) => {
    expect(isDefaultChecked(level)).toBe(checked);
  });

  it("seule la ligne Info n’est pas sélectionnable", () => {
    expect(isSelectable("Info")).toBe(false);
    expect(isSelectable("Déjà valide")).toBe(true);
  });
});
