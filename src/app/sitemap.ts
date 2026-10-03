import type { MetadataRoute } from "next";
import { COMMUNES, DIAGNOSTIC_IDS } from "@/lib/data/lookup";
import { LOCAL_IDS } from "@/lib/domain/city-content";
import { routes } from "@/lib/domain/routes";
import { getPublishedArticles } from "@/lib/repos/articles";
import { LEGAL_DOCS } from "@/lib/schemas/content";
import { absoluteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  const page = (
    path: string,
    priority: number,
    lastModified?: string | null,
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    priority,
    ...(lastModified ? { lastModified } : {}),
  });
  return [
    page(routes.home(), 1),
    page(routes.devis(), 0.9),
    page(routes.zones(), 0.6),
    page(routes.articles(), 0.6),
    ...DIAGNOSTIC_IDS.map((id) => page(routes.diagnostic(id), 0.9)),
    ...LOCAL_IDS.flatMap((id) => COMMUNES.map((c) => page(routes.city(id, c.slug), 0.7))),
    ...articles.map((a) => page(routes.article(a.slug), 0.5, a.updatedAt ?? a.publishedAt)),
    ...LEGAL_DOCS.map((d) => page(`/${d}`, 0.2)),
  ];
}
