import { PhotoCards } from "@/components/admin/PhotoCards";
import { requireAdmin } from "@/lib/firebase/session";
import { readSiteSettings } from "@/lib/repos/settings";
import { removePhoto, savePortraitAlt, uploadPhoto } from "./actions";

export default async function PhotosPage() {
  await requireAdmin();
  const s = await readSiteSettings();
  return (
    <PhotoCards
      initial={s.photos}
      updatedAt={s.updatedAt}
      upload={uploadPhoto}
      remove={removePhoto}
      saveAlt={savePortraitAlt}
    />
  );
}
