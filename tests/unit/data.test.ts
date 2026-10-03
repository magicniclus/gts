import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMMUNES,
  COMMUNE_COUNT,
  DIAGNOSTIC_IDS,
  DIAGNOSTICS,
  LOCAL_DIAGNOSTIC_IDS,
  SECTEURS,
  SECTEUR_IDS,
  communeLabel,
  communesOfSecteur,
  findCommune,
  getDiagnostic,
  isDiagnosticId,
} from "@/lib/data/lookup";
import {
  DEVIS_OPTIONS,
  DEVIS_STEPS,
  optionLabel,
} from "@/lib/data/devis-options";
import { slugify } from "@/lib/domain/slug";

const json = (p: string) =>
  JSON.parse(
    readFileSync(resolve(__dirname, "../../docs/handoff/data", p), "utf8"),
  );

describe("communes", () => {
  it("reprend exactement docs/handoff/data/communes.json", () => {
    const raw = json("communes.json");
    expect(COMMUNES).toEqual(raw.communes);
    expect(SECTEURS).toEqual(raw.secteurs);
  });

  it("compte 84 communes aux slugs uniques, dérivés du nom", () => {
    expect(COMMUNES).toHaveLength(84);
    expect(new Set(COMMUNES.map((c) => c.slug)).size).toBe(84);
    for (const c of COMMUNES) expect(c.slug).toBe(slugify(c.name));
  });

  it("rattache chaque commune à un secteur connu", () => {
    for (const c of COMMUNES) expect(SECTEUR_IDS).toContain(c.secteur);
    const total = SECTEUR_IDS.reduce(
      (n, s) => n + communesOfSecteur(s).length,
      0,
    );
    expect(total).toBe(84);
  });

  it("marque les communes PEB de la maquette", () => {
    const peb = COMMUNES.filter((c) => c.peb).map((c) => c.slug);
    expect(peb).toEqual(
      expect.arrayContaining([
        "marignane",
        "vitrolles",
        "istres",
        "aix-en-provence",
        "marseille-13e",
      ]),
    );
    expect(peb).toHaveLength(17);
  });

  it("trouve une commune par son slug", () => {
    const aubagne = findCommune("aubagne");
    expect(aubagne?.km).toBe(17);
    expect(aubagne && communeLabel(aubagne)).toBe("Aubagne (13400)");
    expect(findCommune("paris")).toBeUndefined();
  });

  it("annonce 69 communes dans le hero (68 hors Marseille + Marseille)", () => {
    expect(COMMUNE_COUNT).toBe(69);
  });
});

describe("diagnostics", () => {
  it("reprend docs/handoff/data/diagnostics.json (icônes sans préfixe ph-)", () => {
    const raw = json("diagnostics.json");
    expect(DIAGNOSTIC_IDS).toEqual(Object.keys(raw));
    for (const id of DIAGNOSTIC_IDS) {
      const { icon, local, ...rest } = DIAGNOSTICS[id];
      const { icon: rawIcon, local: rawLocal, ...rawRest } = raw[id];
      expect(rest).toEqual(rawRest);
      expect(`ph-${icon}`).toBe(rawIcon);
      expect(local).toBe(rawLocal === true);
    }
  });

  it("décline en pages ville DPE, amiante et plomb uniquement", () => {
    expect(LOCAL_DIAGNOSTIC_IDS).toEqual(["dpe", "amiante", "plomb"]);
    expect(LOCAL_DIAGNOSTIC_IDS.length * COMMUNES.length).toBe(252);
  });

  it("reconnaît les identifiants", () => {
    expect(isDiagnosticId("dpe")).toBe(true);
    expect(isDiagnosticId("toString")).toBe(false);
    expect(getDiagnostic("erp").price).toBe(0);
  });
});

describe("options du devis", () => {
  it("a des valeurs uniques dans chaque liste", () => {
    for (const list of Object.values(DEVIS_OPTIONS)) {
      const values = list.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("donne le libellé d’une valeur", () => {
    expect(optionLabel("projet", "vente")).toBe("Je vends mon bien");
    expect(optionLabel("annee", "1949-1997")).toBe("1949 – juin 1997");
    expect(optionLabel("projet", undefined)).toBeUndefined();
    expect(optionLabel("projet", "inconnu")).toBeUndefined();
  });

  it("compte 6 étapes", () => {
    expect(DEVIS_STEPS).toHaveLength(6);
  });
});
