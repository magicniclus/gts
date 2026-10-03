import { RichText } from "@/components/ui/RichText";
import { fillPlaceholders } from "@/lib/domain/markdown-lite";
import type { LegalPage } from "@/lib/schemas/content";
import type { SiteSettings } from "@/lib/schemas/settings";

/** Remplace {telephone}, {email}, {adresse}, {siret}, {certification}, {assurance}. */
export function fillLegal(body: string, site: SiteSettings): string {
  return fillPlaceholders(body, {
    telephone: site.phone,
    email: site.email,
    adresse: site.adresse,
    siret: site.siret,
    certification: site.certification,
    assurance: site.assurance,
  });
}

/** Page légale : colonne de 820 px, H1, intertitres et paragraphes. */
export function LegalPageView({ page, site }: { page: LegalPage; site: SiteSettings }) {
  return (
    <article className="mx-auto max-w-[calc(var(--container-legal)+2*var(--gutter))] px-(--gutter) pt-[clamp(40px,6vw,80px)] pb-[clamp(64px,8vw,112px)]">
      <h1 className="m-0 font-heading text-[clamp(32px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-accent-900 stretch-115">
        {page.title}
      </h1>
      <RichText variant="legal" source={fillLegal(page.body, site)} className="mt-4" />
    </article>
  );
}
