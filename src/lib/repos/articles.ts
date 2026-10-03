import "server-only";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { cacheLife, cacheTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory } from "@/lib/schemas/content";
import { str, timestampToDay, toIso, urlOrNull } from "./convert";
import { TAGS } from "./tags";

const col = () => adminDb().collection("articles");

export function parseArticle(snap: DocumentSnapshot): Article | null {
  const d = snap.data();
  if (!d) return null;
  const category = (ARTICLE_CATEGORIES as readonly string[]).includes(String(d.category))
    ? (d.category as ArticleCategory)
    : "Conseils vente";
  return {
    id: snap.id,
    slug: str(d.slug, snap.id),
    title: str(d.title, ""),
    excerpt: str(d.excerpt, ""),
    body: str(d.body, ""),
    category,
    coverUrl: urlOrNull(d.coverUrl),
    coverAlt: str(d.coverAlt, ""),
    published: d.published === true,
    publishedAt: timestampToDay(d.publishedAt),
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

/** Articles publiés, du plus récent au plus ancien. */
export async function getPublishedArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.articles);
  const snap = await col().where("published", "==", true).orderBy("publishedAt", "desc").get();
  return snap.docs.map(parseArticle).filter((a) => a !== null);
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const all = await getPublishedArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

/** Tous les articles (espace propriétaire), sans cache. */
export async function listAllArticles(): Promise<Article[]> {
  const snap = await col().orderBy("publishedAt", "desc").get();
  return snap.docs.map(parseArticle).filter((a) => a !== null);
}

export async function readArticle(id: string): Promise<Article | null> {
  return parseArticle(await col().doc(id).get());
}
