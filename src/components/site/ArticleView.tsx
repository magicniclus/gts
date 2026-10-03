import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kicker } from "@/components/ui/Kicker";
import { RichText } from "@/components/ui/RichText";
import { routes } from "@/lib/domain/routes";
import { formatDay } from "@/lib/format";
import type { Article } from "@/lib/schemas/content";
import { articleLd } from "@/lib/seo/jsonld";
import { ArticleGrid, type ArticleCardData } from "./ArticleCard";

/** Article : colonne de 780 px, chapeau, couverture, corps, « À lire aussi ». */
export function ArticleView({
  article: a,
  others,
}: {
  article: Article;
  others: readonly ArticleCardData[];
}) {
  const path = routes.article(a.slug);
  return (
    <>
      <article className="mx-auto max-w-[calc(var(--container-article)+2*var(--gutter))] px-(--gutter) pt-[clamp(40px,6vw,80px)]">
        <Breadcrumbs
          tone="onLight"
          currentPath={path}
          items={[
            { name: "Accueil", href: routes.home() },
            { name: "Conseils", href: routes.articles() },
            { name: a.title },
          ]}
        />
        {!a.published && (
          <p className="mt-5 mb-0 rounded-field bg-warning-bg px-3.5 py-2.5 text-sm font-bold text-warning-fg">
            Brouillon : cet article n’est pas encore visible sur le site.
          </p>
        )}
        <div className="mt-7">
          <Kicker>
            {a.category} · {formatDay(a.publishedAt)}
          </Kicker>
        </div>
        <h1 className="mt-4 mb-0 font-heading text-[clamp(32px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance text-accent-900 stretch-115">
          {a.title}
        </h1>
        {a.excerpt && <p className="mt-5 mb-0 text-xl leading-[1.55] text-text/72">{a.excerpt}</p>}
        {a.coverUrl && (
          <div className="relative mt-9 aspect-video overflow-hidden rounded-card bg-accent-900">
            <Image
              src={a.coverUrl}
              alt={a.coverAlt}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 780px"
              className="object-cover"
            />
          </div>
        )}
        <RichText source={a.body} className="mt-3" />
      </article>
      {others.length > 0 && (
        <section className="container-site pt-[clamp(56px,7vw,96px)]">
          <h2 className="m-0 mb-6 font-heading text-[clamp(26px,3vw,36px)] font-extrabold text-accent-900 stretch-112">
            À lire aussi
          </h2>
          <ArticleGrid articles={others} headingLevel="h3" />
        </section>
      )}
      {a.published && (
        <JsonLd
          data={articleLd({
            title: a.title,
            excerpt: a.excerpt,
            path,
            publishedAt: a.publishedAt,
            updatedAt: a.updatedAt,
            coverUrl: a.coverUrl,
          })}
        />
      )}
    </>
  );
}
