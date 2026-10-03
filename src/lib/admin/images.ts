import "server-only";
import { randomUUID } from "node:crypto";
import { adminStorage } from "@/lib/firebase/admin";
import { EMULATORS, STORAGE_BUCKET, USE_EMULATORS } from "@/lib/firebase/config";
import { UserError } from "./run-action";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Vérifie et enregistre une image dans Storage ; renvoie son URL publique (jeton de téléchargement). */
export async function storeImage(file: unknown, path: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) throw new UserError("Aucun fichier reçu.");
  if (!file.type.startsWith("image/")) throw new UserError("Ce fichier n’est pas une image.");
  if (file.size > MAX_IMAGE_BYTES) throw new UserError("Image trop lourde : 5 Mo au maximum.");
  const token = randomUUID();
  const bucket = adminStorage().bucket(STORAGE_BUCKET);
  await bucket.file(path).save(Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  const host = USE_EMULATORS
    ? `http://${EMULATORS.storage.host}:${EMULATORS.storage.port}`
    : "https://firebasestorage.googleapis.com";
  return `${host}/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function deleteImage(path: string): Promise<void> {
  await adminStorage().bucket(STORAGE_BUCKET).file(path).delete({ ignoreNotFound: true });
}
