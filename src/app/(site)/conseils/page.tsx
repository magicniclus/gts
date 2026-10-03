import type { Metadata } from "next";
import { ArticleGrid } from "@/components/site/ArticleCard";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { toCard } from "@/lib/articles-view";
import { getPublishedArticles } from "@/lib/repos/articles";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Conseils diagnostics immobiliers | GTS Diagnostic",
  description:
    "Réglementation 2026, obligations à la vente et à la location, particularités du bâti marseillais : les conseils de Guillaume Tilliet, diagnostiqueur certifié.",
  path: "/conseils",
});

export default async function ArticlesPage() {
  const [articles, site] = await Promise.all([getPublishedArticles(), getSiteSettings()]);
  return (
    <>
      <PageHero
        kicker="Conseils & actualités"
        title="Diagnostics immobiliers :"
        highlight="ce qu’il faut savoir"
        after="."
        intro="Réglementation 2026, obligations à la vente et à la location, particularités du bâti marseillais."
      />
      <section className="container-site py-[clamp(48px,6vw,88px)]">
        {articles.length ? (
          <ArticleGrid articles={articles.map(toCard)} />
        ) : (
          <p className="text-base">Aucun article publié pour le moment.</p>
        )}
      </section>
      <CtaBand phone={site.phone} />
    </>
  );
}
