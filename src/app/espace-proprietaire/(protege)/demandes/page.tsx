import { LeadList } from "@/components/admin/LeadList";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/firebase/session";
import { listLeads } from "@/lib/repos/leads";
import { deleteLead, updateLeadNotes, updateLeadStatus } from "./actions";

export default async function DemandesPage({
  searchParams,
}: PageProps<"/espace-proprietaire/demandes">) {
  await requireAdmin(); // lecture du cookie : rendu à la requête, jamais pré-rendu
  const [{ id }, leads] = await Promise.all([searchParams, listLeads()]);
  return (
    <>
      <PageHeader
        title="Demandes de devis"
        sub="Chaque formulaire envoyé arrive ici avec les diagnostics retenus et l’estimation affichée au client."
      />
      <LeadList
        leads={leads}
        initialOpen={typeof id === "string" ? id : null}
        actions={{ setStatus: updateLeadStatus, setNotes: updateLeadNotes, remove: deleteLead }}
      />
    </>
  );
}
