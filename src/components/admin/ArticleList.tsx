import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { CATEGORY_ICONS } from "@/components/site/ArticleCard";
import { buttonClasses } from "@/components/ui/Button";
import { formatDay } from "@/lib/format";
import type { Article } from "@/lib/schemas/content";

/** Liste des articles : vignette, titre, catégorie et date, statut, Modifier. */
export function ArticleList({ articles }: { articles: readonly Article[] }) {
  if (!articles.length)
    return (
      <p className="mt-5 rounded-card-sm bg-white p-7 text-center">Aucun article pour le moment.</p>
    );
  return (
    <ul className="m-0 mt-[18px] grid list-none gap-2.5 p-0">
      {articles.map((a) => (
        <li
          key={a.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card-sm bg-white py-3 pr-4 pl-3"
        >
          <div className="relative grid h-14 w-[84px] flex-none place-items-center overflow-hidden rounded-lg bg-accent-900 text-accent-400">
            {a.coverUrl ? (
              <Image src={a.coverUrl} alt="" fill sizes="84px" className="object-cover" />
            ) : (
              <Icon name={CATEGORY_ICONS[a.category] ?? "newspaper"} size={24} />
            )}
          </div>
          <div className="grid min-w-0 flex-[1_1_240px] gap-0.5">
            <strong className="text-base font-bold">{a.title}</strong>
            <span className="text-[13px] text-text/72">
              {a.category} · {formatDay(a.publishedAt, "short")}
            </span>
          </div>
          <Tag tone={a.published ? "success" : "neutral"} className="text-[13px]">
            {a.published ? "Publié" : "Brouillon"}
          </Tag>
          <Link
            href={`/espace-proprietaire/articles/${a.id}`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
            aria-label={`Modifier « ${a.title} »`}
          >
            <Icon name="pencil-simple" size={18} />
            Modifier
          </Link>
        </li>
      ))}
    </ul>
  );
}
