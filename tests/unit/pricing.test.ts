import { describe, expect, it } from "vitest";
import { diagList } from "@/lib/domain/obligations";
import {
  buildRows,
  deplacementFor,
  estimate,
  formatPrice,
  fromPrice,
  priceOf,
  round5,
} from "@/lib/domain/pricing";
import type { Answers, CommuneInfo } from "@/lib/domain/types";
import { DEFAULT_PRICING as P, withRules } from "../fixtures/pricing";

const commune = (name: string, km: number, peb = false): CommuneInfo => ({
  name,
  cp: "13000",
  km,
  peb,
});
const marseille8 = commune("Marseille 8e", 0);
const aubagne = commune("Aubagne", 17);
const laCiotat = commune("La Ciotat", 32);
const istres = commune("Istres", 45, true);

const A: Answers = {
  projet: "vente",
  type: "appartement",
  surface: "30-60",
  annee: "avant1949",
  copro: "oui",
  elec: "plus15",
  gaz: "plus15",
};
const B: Answers = {
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
const F: Answers = {
  projet: "location",
  loc: "vide",
  type: "appartement",
  surface: "30-60",
  annee: "1949-1997",
  copro: "oui",
  elec: "moins15",
  gaz: "aucun",
};

const run = (a: Answers, c: CommuneInfo | undefined, pricing = P, checked?: readonly string[]) => {
  const rows = buildRows(diagList(a, c), a, pricing, checked);
  return {
    rows,
    prices: Object.fromEntries(rows.filter((r) => r.on).map((r) => [r.id, r.price])),
    est: estimate(rows, c, pricing),
  };
};

describe("cas chiffrés A à J (barème par défaut)", () => {
  it("A : Marseille 8e → 540 €", () => {
    const { prices, est } = run(A, marseille8);
    expect(prices).toEqual({
      dpe: 115,
      amiante: 95,
      plomb: 115,
      electricite: 90,
      gaz: 85,
      carrez: 55,
      termites: 80,
      erp: 0,
    });
    expect(est).toEqual({
      sub: 635,
      remise: 95,
      deplacement: 0,
      total: 540,
      surDevis: false,
      pack: true,
      paidCount: 7,
    });
  });

  it("B : maison à Aubagne → 1015 €, mesurage optionnel non coché", () => {
    const { rows, prices, est } = run(B, aubagne);
    expect(prices).toEqual({
      dpe: 180,
      amiante: 165,
      electricite: 125,
      termites: 135,
      erp: 0,
      audit: 590,
    });
    expect(rows.find((r) => r.id === "carrez")).toMatchObject({
      level: "Optionnel",
      on: false,
      price: 80,
    });
    expect(est).toMatchObject({
      sub: 1195,
      remise: 180,
      deplacement: 0,
      total: 1015,
    });
  });

  it("C : La Ciotat (32 km) → 560 €", () => {
    expect(run(A, laCiotat).est).toMatchObject({
      sub: 635,
      remise: 95,
      deplacement: 20,
      total: 560,
    });
  });

  it("D : Istres (45 km) → 570 €", () => {
    expect(run(A, istres).est).toMatchObject({
      sub: 635,
      remise: 95,
      deplacement: 30,
      total: 570,
    });
  });

  it("E : immeuble entier → tout sur devis, ERP offert", () => {
    const { rows, est } = run(
      {
        projet: "vente",
        type: "immeuble",
        surface: "150+",
        annee: "avant1949",
      },
      marseille8,
    );
    for (const r of rows) expect(r.price).toBe(r.id === "erp" ? 0 : null);
    expect(est).toMatchObject({
      sub: 0,
      remise: 0,
      deplacement: 0,
      total: 0,
      surDevis: true,
      pack: false,
    });
  });

  it("F : location vide à Marseille 1er → 225 €", () => {
    const { prices, est } = run(F, commune("Marseille 1er", 0));
    expect(prices).toEqual({ dpe: 115, amiante: 95, carrez: 55, erp: 0 });
    expect(est).toMatchObject({
      sub: 265,
      remise: 40,
      deplacement: 0,
      total: 225,
      pack: true,
      paidCount: 3,
    });
  });

  it("G : location saisonnière → 115 €", () => {
    const { prices, est } = run(
      {
        projet: "location",
        loc: "saisonniere",
        type: "appartement",
        surface: "30-60",
        annee: "avant1949",
      },
      marseille8,
    );
    expect(prices).toEqual({ dpe: 115 });
    expect(est).toMatchObject({
      sub: 115,
      remise: 0,
      deplacement: 0,
      total: 115,
      pack: false,
    });
  });

  it("H : DPE déjà valide, non coché → 440 €", () => {
    const { rows, est } = run({ ...A, deja: ["dpe"] }, marseille8);
    expect(rows.find((r) => r.id === "dpe")).toMatchObject({
      level: "Déjà valide",
      on: false,
    });
    expect(est).toMatchObject({ sub: 520, remise: 80, total: 440 });
  });

  it("I : année inconnue → lignes à vérifier cochées", () => {
    const { rows } = run(
      {
        projet: "vente",
        type: "appartement",
        surface: "30-60",
        annee: "nsp",
        copro: "oui",
        elec: "nsp",
      },
      marseille8,
    );
    for (const id of ["amiante", "plomb", "electricite"]) {
      expect(rows.find((r) => r.id === id)).toMatchObject({
        level: "À vérifier",
        on: true,
      });
    }
  });

  it("J : maison avec garage et cave, 60–100 m²", () => {
    const a: Answers = {
      projet: "vente",
      type: "maison",
      surface: "60-100",
      annee: "1949-1997",
      annexes: ["garage", "cave"],
    };
    expect(priceOf("amiante", a, P)).toBe(150);
    expect(priceOf("termites", a, P)).toBe(130);
  });
});

describe("priceOf", () => {
  const appart: Answers = {
    projet: "vente",
    type: "appartement",
    surface: "<30",
  };

  it("ERP toujours offert, même pour un immeuble", () => {
    expect(priceOf("erp", appart, P)).toBe(0);
    expect(priceOf("erp", { type: "immeuble" }, P)).toBe(0);
  });
  it("SPANC non chiffré", () => {
    expect(priceOf("spanc", appart, P)).toBeNull();
  });
  it("immeuble entier → sur devis", () => {
    expect(priceOf("dpe", { type: "immeuble", surface: "<30" }, P)).toBeNull();
  });
  it("prend la première tranche si la surface n’est pas renseignée", () => {
    expect(priceOf("dpe", { type: "appartement" }, P)).toBe(100);
  });
  it("utilise chaque tranche", () => {
    const bands = ["<30", "30-60", "60-100", "100-150", "150+"] as const;
    expect(bands.map((surface) => priceOf("gaz", { type: "appartement", surface }, P))).toEqual([
      80, 85, 90, 95, 100,
    ]);
  });
  it("majore la maison seulement pour DPE, amiante, plomb, électricité et termites", () => {
    const maison: Answers = { type: "maison", surface: "<30" };
    expect(priceOf("dpe", maison, P)).toBe(115);
    expect(priceOf("plomb", maison, P)).toBe(115);
    expect(priceOf("electricite", maison, P)).toBe(90); // 92 → 90
    expect(priceOf("gaz", maison, P)).toBe(80);
    expect(priceOf("carrez", maison, P)).toBe(45);
    expect(priceOf("audit", maison, P)).toBe(450);
    expect(priceOf("raat", maison, P)).toBe(220);
  });
  it("ajoute le supplément annexe à amiante, termites et RAAT, sans compter la piscine", () => {
    const a: Answers = {
      type: "appartement",
      surface: "<30",
      annexes: ["cave", "piscine", "parking"],
    };
    expect(priceOf("amiante", a, P)).toBe(105);
    expect(priceOf("termites", a, P)).toBe(90);
    expect(priceOf("raat", a, P)).toBe(240);
    expect(priceOf("dpe", a, P)).toBe(100);
    expect(priceOf("amiante", { ...a, annexes: ["piscine"] }, P)).toBe(85);
  });
  it("arrondit aux 5 € les plus proches", () => {
    expect(round5(152.25)).toBe(150);
    expect(round5(152.5)).toBe(155);
    expect(round5(127.4)).toBe(125);
  });
  it("calcule en entiers (pas d’erreur d’arrondi flottant)", () => {
    // 110 × 1,15 = 126,49999… en flottant ; 12650 / 500 = 25,3 exactement → 125
    expect(priceOf("electricite", { type: "maison", surface: "100-150" }, P)).toBe(125);
    // 130 × 1,15 = 149,5 → 150 (moitié arrondie vers le haut)
    const grid = { ...P.grid, dpe: [130, 0, 0, 0, 0] as const };
    expect(priceOf("dpe", { type: "maison", surface: "<30" }, { ...P, grid })).toBe(150);
  });
  it("majoration maison réglable (0 %)", () => {
    expect(priceOf("dpe", { type: "maison", surface: "100-150" }, withRules({ maison: 0 }))).toBe(
      155,
    );
  });
  it("supplément annexe réglable", () => {
    expect(
      priceOf(
        "termites",
        { type: "appartement", surface: "<30", annexes: ["cave"] },
        withRules({ annexe: 25 }),
      ),
    ).toBe(95);
  });
  it("local pro → grille DPE tertiaire", () => {
    const rows = buildRows(
      diagList({ projet: "vente", type: "local", surface: "30-60" }),
      { projet: "vente", type: "local", surface: "30-60" },
      P,
    );
    expect(rows.find((r) => r.id === "dpe")).toMatchObject({
      priceKey: "dpet",
      price: 220,
    });
  });
});

describe("buildRows", () => {
  it("coche par défaut Obligatoire et À vérifier", () => {
    const rows = buildRows(diagList(B, aubagne), B, P);
    expect(rows.filter((r) => r.on).map((r) => r.id)).toEqual([
      "dpe",
      "amiante",
      "electricite",
      "termites",
      "erp",
      "audit",
    ]);
  });

  it("applique la sélection du client (liste des id cochés)", () => {
    const rows = buildRows(diagList(B, aubagne), B, P, ["dpe", "carrez", "spanc"]);
    expect(rows.filter((r) => r.on).map((r) => r.id)).toEqual(["dpe", "carrez"]);
  });

  it("ne coche jamais la ligne Info (SPANC)", () => {
    const a: Answers = { ...B, egout: "non" };
    const rows = buildRows(diagList(a, aubagne), a, P, ["spanc"]);
    expect(rows.find((r) => r.id === "spanc")).toMatchObject({
      on: false,
      price: null,
    });
  });

  it("travaux + démolition → « Amiante avant démolition » au prix RAAT", () => {
    const a: Answers = {
      projet: "travaux",
      nature: "demolition",
      type: "maison",
      surface: "<30",
      annee: "avant1949",
    };
    const rows = buildRows(diagList(a), a, P);
    expect(rows.find((r) => r.id === "amiante")).toMatchObject({
      name: "Amiante avant démolition",
      priceKey: "raat",
      price: 220,
    });
  });
});

describe("estimate : règles réglables", () => {
  it("packMin = 4 désactive la remise du cas F", () => {
    const pricing = withRules({ packMin: 4 });
    expect(run(F, marseille8, pricing).est).toMatchObject({
      sub: 265,
      remise: 0,
      total: 265,
      pack: false,
    });
  });
  it("packPct = 0 → pas de remise", () => {
    expect(run(A, marseille8, withRules({ packPct: 0 })).est).toMatchObject({
      remise: 0,
      total: 635,
      pack: true,
    });
  });
  it("l’ERP offert ne compte pas dans le pack", () => {
    const { est } = run(F, marseille8, P, ["dpe", "amiante", "erp"]);
    expect(est).toMatchObject({
      paidCount: 2,
      pack: false,
      remise: 0,
      total: 210,
    });
  });
  it("déplacement réglable (d30, d40)", () => {
    const pricing = withRules({ d30: 25, d40: 45 });
    expect(run(A, laCiotat, pricing).est.deplacement).toBe(25);
    expect(run(A, istres, pricing).est.deplacement).toBe(45);
  });
  it("déplacement : seuils stricts à 30 et 40 km", () => {
    expect(deplacementFor(commune("x", 30), P.rules)).toBe(0);
    expect(deplacementFor(commune("x", 31), P.rules)).toBe(20);
    expect(deplacementFor(commune("x", 40), P.rules)).toBe(20);
    expect(deplacementFor(commune("x", 41), P.rules)).toBe(30);
    expect(deplacementFor(undefined, P.rules)).toBe(0);
  });
  it("sur devis si une ligne cochée n’a pas de prix, SPANC exclu", () => {
    const rows = [
      {
        id: "spanc",
        priceKey: "spanc",
        name: "x",
        level: "Info",
        reason: "",
        price: null,
        on: true,
      },
      {
        id: "dpe",
        priceKey: "dpe",
        name: "x",
        level: "Obligatoire",
        reason: "",
        price: 100,
        on: true,
      },
    ] as const;
    expect(estimate(rows, undefined, P)).toMatchObject({
      surDevis: false,
      sub: 100,
    });
  });
  it("aucune ligne → total nul", () => {
    expect(estimate([], marseille8, P)).toEqual({
      sub: 0,
      remise: 0,
      deplacement: 0,
      total: 0,
      surDevis: false,
      pack: false,
      paidCount: 0,
    });
  });
});

describe("affichage", () => {
  it("formate un prix", () => {
    expect(formatPrice(0)).toBe("Offert");
    expect(formatPrice(null)).toBe("Sur devis");
    expect(formatPrice(115)).toBe("115 €");
    expect(formatPrice(1015)).toBe("1 015 €");
  });
  it("prix « dès » = première tranche", () => {
    expect(fromPrice("dpe", P)).toBe(100);
    expect(fromPrice("amiante", P)).toBe(85);
  });
});
