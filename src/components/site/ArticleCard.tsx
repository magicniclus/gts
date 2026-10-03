import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/domain/routes";

export const CATEGORY_ICONS: Record<string, string> = {
  DPE: "lightning",
  Amiante: "warning-diamond",
  Plomb: "paint-roller",
  Réglementation: "scales",
  "Conseils vente": "key",
  "Conseils location": "house-line",
};

export type ArticleCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  coverUrl: string | null;
  coverAlt: string;
};

export function ArticleCard({
  a,
  headingLevel = "h2",
}: {
  a: ArticleCardData;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <Link
      href={routes.article(a.slug)}
      className="grid h-full content-start overflow-hidden rounded-card bg-surface text-text hover:text-accent"
    >
      <div className="relative grid aspect-video place-items-center overflow-hidden bg-accent-900 text-accent-400">
        {a.coverUrl ? (
          <Image
            src={a.coverUrl}
            alt={a.coverAlt}
            fill
            sizes="(max-width: 700px) 100vw, 400px"
            className="object-cover"
          />
        ) : (
          <Icon name={CATEGORY_ICONS[a.category] ?? "newspaper"} size={48} />
        )}
      </div>
      <div className="grid gap-2.5 px-[22px] pt-5 pb-6">
        <span className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {a.category} · {a.dateLabel}
        </span>
        <H className="m-0 font-heading text-[21px] leading-tight font-extrabold stretch-108">
          {a.title}
        </H>
        <p className="m-0 text-[15px] leading-normal text-text/72">{a.excerpt}</p>
      </div>
    </Link>
  );
}

export function ArticleGrid({
  articles,
  headingLevel,
}: {
  articles: readonly ArticleCardData[];
  headingLevel?: "h2" | "h3";
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5 p-0">
      {articles.map((a) => (
        <li key={a.slug}>
          <ArticleCard a={a} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
