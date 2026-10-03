import { beforeEach, describe, expect, it } from "vitest";
import { createLead } from "@/lib/leads/create-lead";
import { clearFirestore, db } from "./helpers";
import { VALID_LEAD } from "../fixtures/lead";

const ctx = (ip = "203.0.113.7") => ({ ip, userAgent: "vitest" });

beforeEach(clearFirestore);

describe("createLead (émulateur)", () => {
  it("crée un lead L-1001 puis L-1002, recalculé avec le barème Firestore", async () => {
    const a = await createLead(VALID_LEAD, ctx());
    const b = await createLead(VALID_LEAD, ctx());
    expect(a).toEqual({ ok: true, ref: "L-1001", total: 540, surDevis: false });
    expect(b).toMatchObject({ ok: true, ref: "L-1002" });

    const lead = (await db().doc("leads/L-1001").get()).data();
    expect(lead).toMatchObject({
      ref: "L-1001",
      status: "nouveau",
      notes: "",
      contact: {
        nom: "Sophie Marchetti",
        tel: "06 21 44 87 10",
        email: "s.m@exemple.fr",
        profil: "particulier",
      },
      bien: { projet: "vente", commune: "marseille-8e", surface: "30-60" },
      rdv: { delai: "semaine" },
      estimate: { sub: 635, remise: 95, deplacement: 0, total: 540, surDevis: false },
      pricingSnapshot: { rules: { maison: 15, packPct: 15 } },
      meta: { source: "site", userAgent: "vitest" },
    });
    expect(lead?.diagnostics).toHaveLength(8);
    expect(lead?.meta.ip).toMatch(/^[0-9a-f]{64}$/);
    expect(lead?.meta.ip).not.toContain("203.0.113.7");
    expect(lead?.consent.text).toMatch(/J’accepte/);
    expect((await db().doc("settings/counters").get()).data()).toEqual({ leadSeq: 1002 });
  });

  it("ignore un total falsifié envoyé par le client et utilise le barème modifié", async () => {
    await db()
      .doc("settings/pricing")
      .set({ grid: { dpe: [120, 120, 120, 120, 120] }, rules: { packPct: 0 } });
    const res = await createLead({ ...VALID_LEAD, total: 1, estimate: { total: 1 } }, ctx());
    expect(res).toMatchObject({ ok: true, total: 640 });
    const lead = (await db().doc("leads/L-1001").get()).data();
    expect(lead?.estimate.total).toBe(640);
    expect(lead?.pricingSnapshot.grid.dpe).toEqual([120, 120, 120, 120, 120]);
  });

  it("refuse la 6ᵉ demande d’une même IP dans l’heure", async () => {
    for (let i = 0; i < 5; i++)
      expect((await createLead(VALID_LEAD, ctx("198.51.100.9"))).ok).toBe(true);
    const sixth = await createLead(VALID_LEAD, ctx("198.51.100.9"));
    expect(sixth).toMatchObject({ ok: false, error: expect.stringMatching(/Trop de demandes/) });
    expect((await createLead(VALID_LEAD, ctx("198.51.100.10"))).ok).toBe(true);
    const later = await createLead(VALID_LEAD, {
      ...ctx("198.51.100.9"),
      now: new Date(Date.now() + 61 * 60 * 1000),
    });
    expect(later.ok).toBe(true);
  });

  it("rejette le honeypot et les données invalides sans rien écrire", async () => {
    expect(await createLead({ ...VALID_LEAD, website: "spam" }, ctx())).toEqual({
      ok: false,
      error: "Demande refusée.",
    });
    const bad = await createLead(
      { ...VALID_LEAD, contact: { ...VALID_LEAD.contact, tel: "1" } },
      ctx(),
    );
    expect(bad).toMatchObject({
      ok: false,
      fieldErrors: { "contact.tel": "Numéro de téléphone invalide." },
    });
    expect((await db().collection("leads").get()).size).toBe(0);
  });

  it("refuse si App Check échoue", async () => {
    const res = await createLead(VALID_LEAD, { ...ctx(), verifyAppCheck: async () => false });
    expect(res).toMatchObject({ ok: false, error: expect.stringMatching(/anti-robot/) });
  });
});
