"use server";

import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { deleteImage, storeImage } from "@/lib/admin/images";
import { adminAction } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { TAGS } from "@/lib/repos/tags";

const PHOTO_SLOTS = {
  portrait: { field: "portraitUrl", path: "site/portrait.jpg" },
  logoLight: { field: "logoLightUrl", path: "site/logo-light.png" },
  logoDark: { field: "logoDarkUrl", path: "site/logo-dark.png" },
} as const;

const slot = z.enum(["portrait", "logoLight", "logoDark"]);

async function setPhoto(field: string, url: string | null) {
  await adminDb()
    .doc("settings/site")
    .set({ photos: { [field]: url }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Remplace une photo : envoi vers Storage (image, 5 Mo max) puis URL dans settings/site. */
export async function uploadPhoto(form: FormData) {
  return adminAction(
    z.object({ slot, file: z.instanceof(File) }),
    { slot: form.get("slot"), file: form.get("file") },
    async ({ slot: s, file }) => {
      const { field, path } = PHOTO_SLOTS[s];
      const url = await storeImage(file, path);
      await setPhoto(field, url);
      return url;
    },
    [TAGS.settings],
  );
}

/** Retire une photo (le logo d’origine du dépôt reprend sa place). */
export async function removePhoto(input: { slot: string }) {
  return adminAction(
    z.object({ slot }),
    input,
    async ({ slot: s }) => {
      const { field, path } = PHOTO_SLOTS[s];
      await setPhoto(field, null);
      await deleteImage(path);
    },
    [TAGS.settings],
  );
}

export async function savePortraitAlt(input: { portraitAlt: string }) {
  return adminAction(
    z.object({ portraitAlt: z.string().trim().max(200) }),
    input,
    async ({ portraitAlt }) => {
      await adminDb()
        .doc("settings/site")
        .set({ photos: { portraitAlt }, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    },
    [TAGS.settings],
  );
}
