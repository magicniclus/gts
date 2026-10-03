import { describe, expect, it } from "vitest";
import { COMMUNES, DIAGNOSTIC_IDS, findCommune } from "@/lib/data/lookup";
import {
  LOCAL_IDS,
  cityPage,
  diagPage,
  isLocalDiagnostic,
  kmLabel,
  nameHash,
  neighborsOf,
  rdvDelay,
} from "@/lib/domain/city-content";
import { routes } from "@/lib/domain/routes";
import { fitText } from "@/lib/domain/seo-text";
import { DEFAULT_PRICING as P } from "../fixtures/pricing";

const must = (slug: string) => {
  const c = findCommune(slug);
  if (!c) throw new Error(slug);
  return c;
};

describe("pages ville : les 252 combinaisons", () => {
  const all = LOCAL_IDS.flatMap((id) =>
    COMMUNES.map((c) => ({ id, c, page: cityPage(c, id, P.grid[id][0]) })),
  );

  it("compte 252 pages", () => expect(all).toHaveLength(252));

  it("titre ≤ 60 caractères, description ≤ 155, intro non vide", () => {
    for (const { page } of all) {
      expect(page.metaTitle.length, page.metaTitle).toBeLessThanOrEqual(60);
      expect(page.metaDesc.length, page.metaDesc).toBeLessThanOrEqual(155);
      expect(page.intro.trim()).not.toBe("");
    }
  });

  it("titres uniques", () => {
    expect(new Set(all.map((p) => p.page.metaTitle)).size).toBe(252);
  });

  it("pas deux intros identiques au sein d’un même secteur", () => {
    const seen = new Map<string, Set<string>>();
    for (const { id, c, page } of all) {
      const key = `${id}:${c.secteur}`;
      const set = seen.get(key) ?? new Set<string>();
      expect(set.has(page.intro), page.intro).toBe(false);
      set.add(page.intro);
      seen.set(key, set);
    }
  });

  it("chemins publics et liens connexes", () => {
    for (const { id, c, page } of all) {
      expect(page.path).toBe(`/diagnostic-${id}/${c.slug}`);
      expect(page.related).toHaveLength(2);
      expect(page.related.every((r) => r.href.endsWith(`/${c.slug}`))).toBe(true);
      expect(page.neighbors.length).toBeGreaterThan(0);
      expect(page.neighbors.length).toBeLessThanOrEqual(8);
      expect(page.blocks.map((b) => b.n)).toEqual(["01", "02", "03"]);
    }
  });
});

describe("cityPage : contenu de la maquette", () => {
  it("Aubagne, DPE (bâti mixte, 17 km)", () => {
    const p = cityPage(must("aubagne"), "dpe", 100);
    expect(p.h1a).toBe("Diagnostic DPE");
    expect(p.h1b).toBe("à Aubagne (13400)");
    const hooks = [
      "Vous vendez ou louez à Aubagne ? Le DPE doit figurer dès l’annonce.",
      "Le DPE conditionne la vente et la location de votre logement à Aubagne.",
      "Obtenez votre DPE à Aubagne sous 48 h, rapport livré le lendemain.",
    ];
    expect(p.intro).toBe(
      `${hooks[nameHash("Aubagne") % 3]} Guillaume Tilliet, diagnostiqueur certifié basé à Marseille, intervient à Aubagne à 17 km, sans frais de déplacement.`,
    );
    expect(p.metaTitle).toBe("Diagnostic DPE Aubagne (13400) dès 100 € | GTS Diagnostic");
    expect(p.metaDesc).toBe(
      // La version de la maquette (« Diagnostic de performance énergétique… ») dépasse 155 caractères.
      "Diagnostic DPE à Aubagne : rendez-vous sous 48 h, rapport sous 24 h, diagnostiqueur certifié indépendant. Devis gratuit en 2 minutes.",
    );
    expect(p.facts.map((f) => f.v)).toEqual([
      "17 km de Marseille",
      "Sous 48 h",
      "Dès 100 € TTC",
      "Huveaune & Garlaban",
    ]);
    expect(p.blocks[0]?.t).toBe("Le bâti à Aubagne");
    expect(p.blocks[0]?.p).toMatch(/^Aubagne mêle immeubles.*Trente Glorieuses/);
    expect(p.blocks[2]?.p).toMatch(/enregistré auprès de l’ADEME/);
    expect(p.faq[1]?.a).toBe(
      "Sous 48 h en général. Aubagne fait partie du secteur « Huveaune & Garlaban » couvert chaque semaine.",
    );
    expect(p.crumbs.map((c) => c.name)).toEqual(["Accueil", "Diagnostic DPE", "Aubagne"]);
    expect(p.devisHref).toBe("/devis?commune=aubagne");
    expect(p.cta).toBe("Devis DPE à Aubagne");
  });

  it("Marseille 1er, plomb (bâti haussmannien → angle ancien)", () => {
    const p = cityPage(must("marseille-1er"), "plomb", 100);
    expect(p.intro).toMatch(
      /intervient à Marseille 1er au cœur de sa zone, sans frais de déplacement\.$/,
    );
    expect(p.facts[0]?.v).toBe("Marseille intra-muros");
    expect(p.blocks[0]?.p).toMatch(/trois-fenêtres.*peintures d’origine au plomb/);
    expect(p.blocks[2]?.p).not.toMatch(/ADEME/);
  });

  it("textes de distance selon les seuils", () => {
    expect(cityPage(must("la-ciotat"), "amiante", 85).intro).toMatch(
      /à 32 km, déplacement inclus\.$/,
    );
    expect(cityPage(must("istres"), "amiante", 85).intro).toMatch(
      /à 45 km, en tournée plusieurs fois par semaine\.$/,
    );
    expect(rdvDelay(35)).toBe("Sous 48 h");
    expect(rdvDelay(36)).toBe("Sous 72 h");
  });

  it("angles grands ensembles, récent et littoral", () => {
    expect(cityPage(must("marseille-13e"), "amiante", 85).blocks[0]?.p).toMatch(
      /grands ensembles.*avant 1997/,
    );
    expect(cityPage(must("gemenos"), "plomb", 100).blocks[0]?.p).toMatch(
      /pavillonnaire.*mas, bastides/,
    );
    expect(cityPage(must("cassis"), "dpe", 100).blocks[0]?.p).toMatch(/bord de mer.*climatisation/);
    expect(cityPage(must("marseille-9e"), "dpe", 100).blocks[0]?.p).toMatch(/alterne villas/);
  });

  it("raccourcit le titre trop long", () => {
    const p = cityPage(must("chateauneuf-les-martigues"), "amiante", 85);
    expect(p.metaTitle).toBe("Diagnostic Amiante Châteauneuf-les-Martigues (13220)");
  });

  it("voisines : même secteur, triées par écart de distance", () => {
    const aubagne = must("aubagne");
    const n = neighborsOf(aubagne);
    expect(n).toHaveLength(8);
    expect(n.every((x) => x.secteur === "est" && x.slug !== "aubagne")).toBe(true);
    const gaps = n.map((x) => Math.abs(x.km - aubagne.km));
    expect(gaps).toEqual([...gaps].sort((a, b) => a - b));
  });

  it("libellé de distance", () => {
    expect(kmLabel({ km: 0 })).toBe("Marseille");
    expect(kmLabel({ km: 22 })).toBe("22 km");
  });
});

describe("diagPage", () => {
  it.each(DIAGNOSTIC_IDS)("%s : titre ≤ 60 et description ≤ 155", (id) => {
    const price = id === "erp" ? 0 : P.grid[id === "carrez" ? "carrez" : id][0];
    const p = diagPage(id, price);
    expect(p.metaTitle.length, p.metaTitle).toBeLessThanOrEqual(60);
    expect(p.metaDesc.length, p.metaDesc).toBeLessThanOrEqual(155);
    expect(p.related).toHaveLength(8);
    expect(p.path).toBe(routes.diagnostic(id));
  });

  it("DPE : titre de la maquette, 84 communes liées", () => {
    const p = diagPage("dpe", 100);
    expect(p.metaTitle).toBe("Diagnostic DPE Marseille dès 100 € | GTS Diagnostic");
    expect(p.h1a).toBe("Diagnostic DPE");
    expect(p.communes).toHaveLength(84);
    expect(p.communes[0]?.href).toBe("/diagnostic-dpe/marseille-1er");
    expect(p.facts[2]?.v).toBe("Dès 100 € TTC");
  });

  it("ERP : offert, sans prix dans le titre, sans communes", () => {
    const p = diagPage("erp", 0);
    expect(p.metaTitle).toBe("Diagnostic ERP Marseille | GTS Diagnostic");
    expect(p.facts[2]?.v).toBe("Offert");
    expect(p.communes).toEqual([]);
    expect(p.h1a).toBe("État des risques et pollutions");
  });

  it("Audit : titre raccourci", () => {
    expect(diagPage("audit", 450).metaTitle).toBe(
      "Diagnostic Audit énergétique Marseille dès 450 €",
    );
  });

  it("description raccourcie quand la version longue dépasse", () => {
    expect(diagPage("plomb", 100).metaDesc.length).toBeLessThanOrEqual(155);
  });
});

describe("outils", () => {
  it("isLocalDiagnostic", () => {
    expect(isLocalDiagnostic("dpe")).toBe(true);
    expect(isLocalDiagnostic("gaz")).toBe(false);
  });

  it("fitText tronque au dernier mot si rien ne tient", () => {
    expect(fitText(["un deux trois quatre"], 12)).toBe("un deux…");
    expect(fitText(["abcdefghijklmnop"], 6)).toBe("abcde…");
    expect(fitText(["court", "long"], 10)).toBe("court");
  });

  it("routes", () => {
    expect(routes.devis()).toBe("/devis");
    expect(routes.devis("la-ciotat")).toBe("/devis?commune=la-ciotat");
    expect(routes.zones()).toBe("/zones-intervention");
    expect(routes.articles()).toBe("/conseils");
    expect(routes.article("x")).toBe("/conseils/x");
    expect(routes.legal("cgv")).toBe("/cgv");
    expect(routes.admin()).toBe("/espace-proprietaire");
  });
});
