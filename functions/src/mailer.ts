import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import type { Email } from "./email";

export type Message = Email & { to: string; replyTo?: string };
export type Mailer = { send(msg: Message): Promise<void> };

export function resendMailer(apiKey: string, from: string): Mailer {
  const resend = new Resend(apiKey);
  return {
    async send(m) {
      const { error } = await resend.emails.send({
        from,
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
        ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      });
      if (error) throw new Error(`Resend : ${error.message}`);
    },
  };
}

/** Fournisseur simulé (émulateur) : les e-mails sont écrits dans la collection _outbox. */
export function outboxMailer(db: Firestore): Mailer {
  return {
    async send(m) {
      await db.collection("_outbox").add({ ...m, createdAt: FieldValue.serverTimestamp() });
    },
  };
}
