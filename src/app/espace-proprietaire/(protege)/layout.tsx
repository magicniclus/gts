import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/firebase/session";
import { countNewLeads } from "@/lib/repos/leads";
import { readSiteSettings } from "@/lib/repos/settings";

/** Vérifie la session (signature, révocation, claim admin) avant tout rendu. */
async function Guarded({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [newLeads, site] = await Promise.all([countNewLeads(), readSiteSettings()]);
  return (
    <AdminShell newLeads={newLeads} logoUrl={site.photos.logoDarkUrl} email={session.email}>
      {children}
    </AdminShell>
  );
}

function Loading() {
  return (
    <div className="flex min-h-screen bg-surface" aria-busy="true">
      <div className="flex-[0_0_250px] bg-accent-900 max-md:hidden" />
      <p className="m-auto text-text/65">Chargement…</p>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Guarded>{children}</Guarded>
    </Suspense>
  );
}
