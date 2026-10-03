import { beforeEach, describe, expect, it } from "vitest";
import { createLead } from "@/lib/leads/create-lead";
import { clearFirestore, db } from "./helpers";
import { VALID_LEAD } from "../fixtures/lead";

async function waitFor<T>(fn: () => Promise<T | null>, timeout = 20_000): Promise<T> {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("délai dépassé");
}

beforeEach(clearFirestore);

describe("onLeadCreated (émulateur Functions, fournisseur simulé)", () => {
  it("envoie la notification à l’adresse de settings/site et l’accusé au client", async () => {
    await db().doc("settings/site").set({ email: "guillaume@exemple.fr", phone: "06 12 34 56 78" });
    const res = await createLead(VALID_LEAD, { ip: "192.0.2.1", userAgent: "vitest" });
    expect(res.ok).toBe(true);
    const mails = await waitFor(async () => {
      const snap = await db().collection("_outbox").get();
      return snap.size >= 2 ? snap.docs.map((d) => d.data()) : null;
    });
    const owner = mails.find((m) => m.to === "guillaume@exemple.fr");
    const client = mails.find((m) => m.to === "s.m@exemple.fr");
    expect(owner?.subject).toBe("Nouvelle demande L-1001 · Marseille 8e · 540 €");
    expect(owner?.text).toContain("/espace-proprietaire/demandes?id=L-1001");
    expect(owner?.replyTo).toBe("s.m@exemple.fr");
    expect(client?.subject).toContain("L-1001");
    expect(client?.text).toContain("06 12 34 56 78");
  });

  it("pas d’accusé de réception sans e-mail client", async () => {
    await db().doc("settings/site").set({ email: "guillaume@exemple.fr", phone: "06" });
    await createLead(
      { ...VALID_LEAD, contact: { ...VALID_LEAD.contact, email: "" } },
      { ip: "192.0.2.2", userAgent: "vitest" },
    );
    const mails = await waitFor(async () => {
      const snap = await db().collection("_outbox").get();
      return snap.size >= 1 ? snap.docs.map((d) => d.data()) : null;
    });
    await new Promise((r) => setTimeout(r, 1500));
    expect((await db().collection("_outbox").get()).size).toBe(1);
    expect(mails[0]?.to).toBe("guillaume@exemple.fr");
  });
});
