"use server";

import { headers } from "next/headers";
import { getAppCheck } from "firebase-admin/app-check";
import { adminApp } from "@/lib/firebase/admin";
import { USE_EMULATORS } from "@/lib/firebase/config";
import { createLead } from "@/lib/leads/create-lead";
import { clientIp } from "@/lib/leads/rate-limit";
import type { SubmitLeadResult } from "@/lib/leads/types";
import type { SubmitLeadInput } from "@/lib/schemas/lead";

/** App Check n’est exigé qu’en production, quand une clé reCAPTCHA est configurée. */
async function verifyAppCheck(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await getAppCheck(adminApp()).verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

/** Server Action du formulaire de devis : tout est revalidé et recalculé côté serveur. */
export async function submitLead(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  const h = await headers();
  const enforceAppCheck = !USE_EMULATORS && !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  try {
    return await createLead(input, {
      ip: clientIp(h),
      userAgent: h.get("user-agent") ?? "",
      verifyAppCheck: enforceAppCheck ? verifyAppCheck : undefined,
    });
  } catch (e) {
    console.error("submitLead", e);
    return { ok: false, error: "Une erreur est survenue. Réessayez ou appelez-nous directement." };
  }
}
