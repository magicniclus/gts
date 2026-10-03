import { HeroEditor } from "@/components/admin/HeroEditor";
import { COMMUNE_COUNT } from "@/lib/data/lookup";
import { requireAdmin } from "@/lib/firebase/session";
import { readSiteSettings } from "@/lib/repos/settings";
import { saveHero } from "./actions";

export default async function AccueilAdminPage() {
  await requireAdmin();
  const site = await readSiteSettings();
  return (
    <HeroEditor
      initial={site.hero}
      updatedAt={site.updatedAt}
      communes={COMMUNE_COUNT}
      save={saveHero}
    />
  );
}
