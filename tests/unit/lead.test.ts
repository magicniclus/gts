import { describe, expect, it } from "vitest";
import { computeLead } from "@/lib/leads/compute";
import { RATE_LIMIT, clientIp, hashIp, nextRateState } from "@/lib/leads/rate-limit";
import { submitLeadSchema } from "@/lib/schemas/lead";
import { DEFAULT_PRICING as P } from "../fixtures/pricing";
import { VALID_LEAD } from "../fixtures/lead";

const issues = (input: unknown) => {
  const r = submitLeadSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("schéma de la demande", () => {
  it("accepte une demande valide", () => {
    expect(issues(VALID_LEAD)).toEqual([]);
  });
  it("refuse une commune inconnue", () => {
    expect(
      issues({ ...VALID_LEAD, answers: { ...VALID_LEAD.answers, commune: "paris-1er" } }),
    ).toEqual(["answers.commune: Commune inconnue."]);
  });
  it("refuse un téléphone invalide", () => {
    expect(issues({ ...VALID_LEAD, contact: { ...VALID_LEAD.contact, tel: "12345" } })).toEqual([
      "contact.tel: Numéro de téléphone invalide.",
    ]);
  });
  it.each([
    "06 12 34 56 78",
    "0612345678",
    "06.12.34.56.78",
    "+33 6 12 34 56 78",
    "04-91-22-18-40",
  ])("accepte le téléphone %s", (tel) =>
    expect(issues({ ...VALID_LEAD, contact: { ...VALID_LEAD.contact, tel } })).toEqual([]),
  );
  it("refuse l’absence de consentement", () => {
    expect(issues({ ...VALID_LEAD, consent: false })[0]).toMatch(/^consent: Votre accord/);
  });
  it("refuse le honeypot rempli", () => {
    expect(issues({ ...VALID_LEAD, website: "http://spam" })).toEqual([
      "website: Demande refusée.",
    ]);
  });
  it("exige le type de location et la nature du chantier", () => {
    expect(
      issues({ ...VALID_LEAD, answers: { ...VALID_LEAD.answers, projet: "location" } }),
    ).toEqual(["answers.loc: Type de location manquant."]);
    expect(
      issues({ ...VALID_LEAD, answers: { ...VALID_LEAD.answers, projet: "travaux" } }),
    ).toEqual(["answers.nature: Nature du chantier manquante."]);
  });
  it("e-mail facultatif, mais valide s’il est saisi", () => {
    const parsed = submitLeadSchema.parse({
      ...VALID_LEAD,
      contact: { ...VALID_LEAD.contact, email: " " },
    });
    expect(parsed.contact.email).toBeNull();
    expect(
      issues({ ...VALID_LEAD, contact: { ...VALID_LEAD.contact, email: "pas-un-mail" } }),
    ).toEqual(["contact.email: Adresse e-mail invalide."]);
  });
  it("ne contient aucun prix : un total envoyé est ignoré", () => {
    const parsed = submitLeadSchema.parse({ ...VALID_LEAD, total: 1, estimate: { total: 1 } });
    expect(parsed).not.toHaveProperty("total");
    expect(parsed).not.toHaveProperty("estimate");
  });
});

describe("computeLead", () => {
  it("cas A recalculé : 540 €", () => {
    const r = computeLead(submitLeadSchema.parse(VALID_LEAD).answers, P, VALID_LEAD.checked);
    expect(r.estimate.total).toBe(540);
  });
  it("cases par défaut sans sélection, commune absente", () => {
    const r = computeLead({ projet: "vente", type: "maison" }, P);
    expect(r.rows.filter((x) => x.on).map((x) => x.id)).toContain("termites");
    expect(r.estimate.deplacement).toBe(0);
  });
});

describe("limite de débit", () => {
  const t0 = 1_000_000;
  it("5 demandes par heure, la 6ᵉ est refusée", () => {
    let state = null as ReturnType<typeof nextRateState>["state"] | null;
    for (let i = 1; i <= RATE_LIMIT.max; i++) {
      const r = nextRateState(state, t0 + i);
      expect(r.allowed).toBe(true);
      state = r.state;
    }
    expect(state?.count).toBe(5);
    expect(nextRateState(state, t0 + 100).allowed).toBe(false);
    expect(nextRateState(state, t0 + 1 + RATE_LIMIT.windowMs)).toEqual({
      allowed: true,
      state: { count: 1, windowStart: t0 + 1 + RATE_LIMIT.windowMs },
    });
  });
  it("hache l’IP avec le sel (HMAC-SHA256)", () => {
    const h = hashIp("203.0.113.7", "sel");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toBe(hashIp("203.0.113.7", "autre"));
    expect(h).toBe(hashIp("203.0.113.7", "sel"));
  });
  it("IP du client derrière le proxy", () => {
    const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(h({}))).toBe("inconnue");
  });
});
