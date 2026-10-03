import type { Firestore } from "firebase-admin/firestore";
import { clientEmail, ownerEmail, type LeadForEmail } from "./email";
import type { Mailer } from "./mailer";

/**
 * Envoie la notification à Guillaume (adresse lue dans settings/site, jamais en dur)
 * et l’accusé de réception au client s’il a saisi un e-mail.
 */
export async function notifyNewLead(
  db: Firestore,
  mailer: Mailer,
  lead: LeadForEmail,
  leadId: string,
  siteUrl: string,
): Promise<{ owner: boolean; client: boolean }> {
  const site = (await db.doc("settings/site").get()).data() ?? {};
  const ownerTo = typeof site.email === "string" ? site.email.trim() : "";
  const phone = typeof site.phone === "string" ? site.phone : "";
  const sent = { owner: false, client: false };
  if (ownerTo) {
    await mailer.send({
      to: ownerTo,
      ...ownerEmail(lead, siteUrl, leadId),
      ...(lead.contact.email ? { replyTo: lead.contact.email } : {}),
    });
    sent.owner = true;
  } else {
    console.error("settings/site.email absent : notification non envoyée", lead.ref);
  }
  if (lead.contact.email) {
    await mailer.send({
      to: lead.contact.email,
      ...clientEmail(lead, phone),
      ...(ownerTo ? { replyTo: ownerTo } : {}),
    });
    sent.client = true;
  }
  return sent;
}
