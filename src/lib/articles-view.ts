import type { ArticleCardData } from "@/components/site/ArticleCard";
import type { Article } from "@/lib/schemas/content";
import { formatDay } from "./format";

export function toCard(a: Article): ArticleCardData {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    dateLabel: formatDay(a.publishedAt),
    coverUrl: a.coverUrl,
    coverAlt: a.coverAlt,
  };
}
