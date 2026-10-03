import type { Metadata } from "next";
import { LegalPageView } from "@/components/site/LegalPageView";
import { getLegalPage } from "@/lib/repos/legal";
import { getSiteSettings } from "@/lib/repos/settings";
import type { LegalDoc } from "@/lib/schemas/content";
import { pageMetadata } from "@/lib/seo/metadata";

/** Fabrique la page et les métadonnées d’un document légal (mentions, CGV, confidentialité). */
export function legalRoute(doc: LegalDoc) {
  async function generateMetadata(): Promise<Metadata> {
    const page = await getLegalPage(doc);
    return pageMetadata({
      title: `${page.title} | GTS Diagnostic`,
      description: `${page.title} du site de GTS Diagnostic, Guillaume Tilliet, diagnostiqueur immobilier certifié à Marseille.`,
      path: `/${doc}`,
    });
  }
  async function Page() {
    const [page, site] = await Promise.all([getLegalPage(doc), getSiteSettings()]);
    return <LegalPageView page={page} site={site} />;
  }
  return { generateMetadata, Page };
}
