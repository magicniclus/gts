import { ContactForm } from "@/components/admin/ContactForm";
import { requireAdmin } from "@/lib/firebase/session";
import { readSiteSettings } from "@/lib/repos/settings";
import { saveContact } from "./actions";

export default async function CoordonneesPage() {
  await requireAdmin();
  const s = await readSiteSettings();
  const { phone, email, hours, adresse, siret, certification, assurance } = s;
  return (
    <ContactForm
      initial={{ phone, email, hours, adresse, siret, certification, assurance }}
      updatedAt={s.updatedAt}
      save={saveContact}
    />
  );
}
