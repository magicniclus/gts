import { notFound } from "next/navigation";
import { LegalEditor } from "@/components/admin/LegalEditor";
import { requireAdmin } from "@/lib/firebase/session";
import { readLegalPage } from "@/lib/repos/legal";
import { isLegalDoc } from "@/lib/schemas/content";
import { saveLegalPage } from "../actions";

export default async function LegalAdminPage({
  params,
}: PageProps<"/espace-proprietaire/pages-legales/[doc]">) {
  await requireAdmin();
  const { doc } = await params;
  if (!isLegalDoc(doc)) notFound();
  const page = await readLegalPage(doc);
  return (
    <LegalEditor
      key={doc}
      doc={doc}
      initial={{ title: page.title, body: page.body }}
      updatedAt={page.updatedAt}
      save={saveLegalPage}
    />
  );
}
