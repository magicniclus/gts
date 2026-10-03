import "server-only";
import { updateTag } from "next/cache";
import type { z } from "zod";
import { assertAdmin, type AdminSession } from "@/lib/firebase/session";
import type { ActionResult } from "./result";

/**
 * Enveloppe commune des Server Actions de l’espace propriétaire :
 * session admin vérifiée, validation zod, écriture (admin SDK), puis updateTag.
 */
export async function adminAction<S extends z.ZodType, R = void>(
  schema: S,
  input: unknown,
  write: (data: z.infer<S>, session: AdminSession) => Promise<R>,
  tags: readonly string[] | ((data: z.infer<S>, result: R) => readonly string[]),
): Promise<ActionResult<R>> {
  let session: AdminSession;
  try {
    session = await assertAdmin();
  } catch {
    return { ok: false, error: "Session expirée : reconnectez-vous." };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { ok: false, error: "Vérifiez les champs signalés.", fieldErrors };
  }
  try {
    const data = await write(parsed.data, session);
    const list = typeof tags === "function" ? tags(parsed.data, data) : tags;
    for (const tag of list) updateTag(tag);
    return { ok: true, savedAt: new Date().toISOString(), data };
  } catch (e) {
    if (e instanceof UserError) return { ok: false, error: e.message };
    console.error("Action admin", e);
    return { ok: false, error: "L’enregistrement a échoué. Réessayez." };
  }
}

/** Erreur dont le message peut être montré tel quel à l’utilisateur. */
export class UserError extends Error {}
