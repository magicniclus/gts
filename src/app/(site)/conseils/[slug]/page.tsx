import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/ArticleView";
import { CtaBand } from "@/components/site/CtaBand";
import { toCard } from "@/lib/articles-view";
import { routes } from "@/lib/domain/routes";
import { DESCRIPTION_MAX, TITLE_MAX, fitText } from "@/lib/domain/seo-text";
import { getPublishedArticles } from "@/lib/repos/articles";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

/** Slug factice : Cache Components exige au moins un paramètre ; il mène à une 404. */
const NO_ARTICLE = "aucun-article";

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: NO_ARTICLE }];
}

async function load(params: PageProps<"/conseils/[slug]">["params"]) {
  const { slug } = await params;
  const all = await getPublishedArticles();
  const article = all.find((a) => a.slug === slug);
  if (!article) notFound();
  return { article, others: all.filter((a) => a.id !== article.id).slice(0, 3) };
}

export async function generateMetadata({
  params,
}: PageProps<"/conseils/[slug]">): Promise<Metadata> {
  const { article } = await load(params);
  return pageMetadata({
    title: fitText([`${article.title} | GTS Diagnostic`, article.title], TITLE_MAX),
    description: fitText([article.excerpt || article.title], DESCRIPTION_MAX),
    path: routes.article(article.slug),
    type: "article",
  });
}

export default async function ArticlePage({ params }: PageProps<"/conseils/[slug]">) {
  const [{ article, others }, site] = await Promise.all([load(params), getSiteSettings()]);
  return (
    <>
      <ArticleView article={article} others={others.map(toCard)} />
      <CtaBand phone={site.phone} />
    </>
  );
}
