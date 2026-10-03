import "server-only";
import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { readPricing } from "@/lib/repos/pricing";
import { CONSENT_TEXT, submitLeadSchema } from "@/lib/schemas/lead";
import { computeLead } from "./compute";
import { hashIp, nextRateState, type RateState } from "./rate-limit";

import type { SubmitLeadResult } from "./types";

export type { SubmitLeadResult };

export type LeadContext = {
  ip: string;
  userAgent: string;
  now?: Date;
  /** Vérifie le jeton App Check ; absent = non vérifié (émulateurs). */
  verifyAppCheck?: (token: string | undefined) => Promise<boolean>;
  db?: Firestore;
};

export const FIRST_LEAD_SEQ = 1000;

/**
 * Crée une demande de devis (03-tarifs-et-obligations.md §6) :
 * zod, honeypot, App Check, limite de débit, prix recalculé, référence séquentielle.
 */
export async function createLead(input: unknown, ctx: LeadContext): Promise<SubmitLeadResult> {
  const parsed = submitLeadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    if (fieldErrors.website) return { ok: false, error: "Demande refusée." };
    return {
      ok: false,
      error: "Certaines informations sont manquantes ou invalides.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  if (ctx.verifyAppCheck && !(await ctx.verifyAppCheck(data.appCheckToken))) {
    return { ok: false, error: "Vérification anti-robot échouée. Rechargez la page et réessayez." };
  }

  const db = ctx.db ?? adminDb();
  const now = ctx.now ?? new Date();
  const ipHash = hashIp(ctx.ip);

  const allowed = await db.runTransaction(async (tx) => {
    const ref = db.collection("rateLimits").doc(ipHash);
    const snap = await tx.get(ref);
    const d = snap.data();
    const current: RateState | null =
      d && d.windowStart instanceof Timestamp
        ? { count: Number(d.count) || 0, windowStart: d.windowStart.toMillis() }
        : null;
    const next = nextRateState(current, now.getTime());
    if (next.allowed) {
      tx.set(ref, {
        count: next.state.count,
        windowStart: Timestamp.fromMillis(next.state.windowStart),
        expiresAt: Timestamp.fromMillis(next.state.windowStart + 60 * 60 * 1000),
      });
    }
    return next.allowed;
  });
  if (!allowed) {
    return {
      ok: false,
      error: "Trop de demandes depuis votre connexion. Réessayez dans une heure ou appelez-nous.",
    };
  }

  const pricing = await readPricing();
  const { rows, estimate } = computeLead(data.answers, pricing, data.checked);
  const selected = rows.filter((r) => r.on);

  const ref = await db.runTransaction(async (tx) => {
    const counter = db.doc("settings/counters");
    const snap = await tx.get(counter);
    const seq = (Number(snap.data()?.leadSeq) || FIRST_LEAD_SEQ) + 1;
    const leadRef = `L-${seq}`;
    tx.set(counter, { leadSeq: seq }, { merge: true });
    const { message, delai, creneau, acces, ...bien } = data.answers;
    tx.create(db.collection("leads").doc(leadRef), {
      ref: leadRef,
      createdAt: Timestamp.fromDate(now),
      status: "nouveau",
      contact: data.contact,
      bien: stripUndefined(bien),
      rdv: stripUndefined({ delai, creneau, acces }),
      message,
      diagnostics: selected.map((r) => ({
        id: r.id,
        name: r.name,
        level: r.level,
        price: r.price,
      })),
      estimate: {
        sub: estimate.sub,
        remise: estimate.remise,
        deplacement: estimate.deplacement,
        total: estimate.total,
        surDevis: estimate.surDevis,
      },
      pricingSnapshot: {
        grid: pricing.grid,
        rules: pricing.rules,
        updatedAt: pricing.updatedAt ? Timestamp.fromDate(new Date(pricing.updatedAt)) : null,
      },
      notes: "",
      consent: { at: Timestamp.fromDate(now), text: CONSENT_TEXT },
      meta: { ip: ipHash, userAgent: ctx.userAgent.slice(0, 300), source: "site" },
      updatedAt: FieldValue.serverTimestamp(),
    });
    return leadRef;
  });

  return { ok: true, ref, total: estimate.total, surDevis: estimate.surDevis };
}

function stripUndefined<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}
