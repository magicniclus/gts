import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { defaultLegalPage } from "@/lib/defaults";
import { adminDb } from "@/lib/firebase/admin";
import type { LegalDoc, LegalPage } from "@/lib/schemas/content";
import { str, toIso } from "./convert";
import { TAGS } from "./tags";

export async function readLegalPage(doc: LegalDoc): Promise<LegalPage> {
  const snap = await adminDb().collection("legalPages").doc(doc).get();
  const fallback = defaultLegalPage(doc);
  const data = snap.data();
  if (!data) return fallback;
  return {
    title: str(data.title, fallback.title),
    body: str(data.body, fallback.body),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getLegalPage(doc: LegalDoc): Promise<LegalPage> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.legal(doc));
  return readLegalPage(doc);
}
