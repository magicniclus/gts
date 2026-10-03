import { describe, expect, it } from "vitest";
import { DEFAULT_ARTICLES, DEFAULT_PRICING, DEFAULT_SITE, defaultLegalPage } from "@/lib/defaults";
import { articleSchema, legalPageSchema, LEGAL_DOCS } from "@/lib/schemas/content";
import { pricingSchema } from "@/lib/schemas/pricing";
import { siteSettingsSchema } from "@/lib/schemas/settings";
import { DEFAULT_PRICING as FIXTURE } from "../fixtures/pricing";

describe("valeurs par défaut", () => {
  it("réglages du site valides, hero renommé", () => {
    expect(siteSettingsSchema.parse(DEFAULT_SITE).hero).toEqual({
      kicker: "Diagnostiqueur indépendant · Marseille",
      title: "Vos diagnostics immobiliers,",
      highlight: "rapport en 24 h.",
      intro: expect.stringContaining("{communes}"),
    });
    expect(DEFAULT_SITE.photos.portraitUrl).toBeNull();
  });

  it("barème identique à la fixture des tests", () => {
    expect(pricingSchema.parse(DEFAULT_PRICING)).toEqual({
      grid: FIXTURE.grid,
      rules: FIXTURE.rules,
    });
  });

  it("pages légales et articles valides", () => {
    for (const doc of LEGAL_DOCS) legalPageSchema.parse(defaultLegalPage(doc));
    expect(defaultLegalPage("cgv").title).toBe("Conditions générales de vente");
    expect(DEFAULT_ARTICLES).toHaveLength(3);
    for (const a of DEFAULT_ARTICLES) articleSchema.parse({ ...a, coverUrl: null, coverAlt: "" });
  });
});
