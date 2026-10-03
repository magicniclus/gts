import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/site/ContentPageView";
import { DIAGNOSTICS, DIAGNOSTIC_IDS, isDiagnosticId } from "@/lib/data/lookup";
import { diagPage } from "@/lib/domain/city-content";
import { diagnosticFromPrice } from "@/lib/domain/pricing";
import { getPricing } from "@/lib/repos/pricing";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

// Servie en /diagnostic-{type}-marseille (rewrite dans next.config.ts).

export function generateStaticParams() {
  return DIAGNOSTIC_IDS.map((type) => ({ type }));
}

async function load(type: string) {
  if (!isDiagnosticId(type)) notFound();
  const pricing = await getPricing();
  const price = diagnosticFromPrice(type, pricing);
  return { id: type, price, page: diagPage(type, price) };
}

export async function generateMetadata({
  params,
}: PageProps<"/diagnostic/[type]">): Promise<Metadata> {
  const { page } = await load((await params).type);
  return pageMetadata({ title: page.metaTitle, description: page.metaDesc, path: page.path });
}

export default async function DiagnosticPage({ params }: PageProps<"/diagnostic/[type]">) {
  const { id, price, page } = await load((await params).type);
  const site = await getSiteSettings();
  return (
    <ContentPageView
      page={page}
      phone={site.phone}
      serviceName={DIAGNOSTICS[id].long}
      area="Marseille"
      price={price}
    />
  );
}
