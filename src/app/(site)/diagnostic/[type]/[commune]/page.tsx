import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/site/ContentPageView";
import { COMMUNES, DIAGNOSTICS, findCommune } from "@/lib/data/lookup";
import { LOCAL_IDS, cityPage, isLocalDiagnostic } from "@/lib/domain/city-content";
import { fromPrice } from "@/lib/domain/pricing";
import { getPricing } from "@/lib/repos/pricing";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

// Servie en /diagnostic-{type}/{commune} (rewrite dans next.config.ts) : 3 × 84 = 252 pages.

export function generateStaticParams() {
  return LOCAL_IDS.flatMap((type) => COMMUNES.map((c) => ({ type, commune: c.slug })));
}

async function load(params: PageProps<"/diagnostic/[type]/[commune]">["params"]) {
  const { type, commune: slug } = await params;
  const commune = findCommune(slug);
  if (!isLocalDiagnostic(type) || !commune) notFound();
  const pricing = await getPricing();
  const price = fromPrice(type, pricing);
  return { type, commune, price, page: cityPage(commune, type, price) };
}

export async function generateMetadata({
  params,
}: PageProps<"/diagnostic/[type]/[commune]">): Promise<Metadata> {
  const { page } = await load(params);
  return pageMetadata({ title: page.metaTitle, description: page.metaDesc, path: page.path });
}

export default async function CityPage({ params }: PageProps<"/diagnostic/[type]/[commune]">) {
  const { type, commune, price, page } = await load(params);
  const site = await getSiteSettings();
  return (
    <ContentPageView
      page={page}
      phone={site.phone}
      serviceName={`${DIAGNOSTICS[type].long} à ${commune.name}`}
      area={commune.name}
      price={price}
    />
  );
}
