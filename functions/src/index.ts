import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import type { LeadForEmail } from "./email";
import { outboxMailer, resendMailer } from "./mailer";
import { notifyNewLead } from "./notify";

initializeApp();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const RESEND_FROM = defineString("RESEND_FROM", {
  default: "GTS Diagnostic <onboarding@resend.dev>",
});
const SITE_URL = defineString("SITE_URL", { default: "http://localhost:3000" });

/** E-mails à la création d’une demande de devis (Resend ; fournisseur simulé dans l’émulateur). */
export const onLeadCreated = onDocumentCreated(
  { document: "leads/{id}", region: "europe-west4", secrets: [RESEND_API_KEY], retry: false },
  async (event) => {
    const lead = event.data?.data() as LeadForEmail | undefined;
    if (!lead) return;
    const db = getFirestore();
    const emulator = process.env.FUNCTIONS_EMULATOR === "true";
    let apiKey = "";
    try {
      apiKey = RESEND_API_KEY.value();
    } catch {
      apiKey = "";
    }
    const mailer =
      !apiKey && emulator ? outboxMailer(db) : resendMailer(apiKey, RESEND_FROM.value());
    const sent = await notifyNewLead(db, mailer, lead, event.params.id, SITE_URL.value());
    logger.info("Notifications envoyées", { ref: lead.ref, ...sent });
  },
);
