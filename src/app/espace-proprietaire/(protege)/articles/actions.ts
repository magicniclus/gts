"use server";

import { FieldValue } from "firebase-admin/firestore";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteImage, storeImage } from "@/lib/admin/images";
import { adminAction, UserError } from "@/lib/admin/run-action";
import { adminDb } from "@/lib/firebase/admin";
import { dayToTimestamp } from "@/lib/repos/convert";
import { TAGS } from "@/lib/repos/tags";
import { articleSchema, type ArticleInput } from "@/lib/schemas/content";

const col = () => adminDb().collection("articles");
const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const coverPath = (articleId: string) => `articles/${articleId}/cover.jpg`;

async function mustExist(articleId: string) {
  const ref = col().doc(articleId);
  if (!(await ref.get()).exists) throw new UserError("Article introuvable.");
  return ref;
}

/** Crée un brouillon puis ouvre l’éditeur. */
export async function createArticle() {
  const r = await adminAction(
    z.object({}),
    {},
    async () => {
      const ref = col().doc();
      const today = new Date().toISOString().slice(0, 10);
      await ref.set({
        slug: `nouvel-article-${ref.id.slice(0, 6).toLowerCase()}`,
        title: "Nouvel article",
        excerpt: "",
        body: "",
        category: "Conseils vente",
        coverUrl: null,
        coverAlt: "",
        published: false,
        publishedAt: dayToTimestamp(today),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return ref.id;
    },
    [TAGS.articles],
  );
  if (r.ok) redirect(`/espace-proprietaire/articles/${r.data}`);
  return r;
}

/** Enregistre un article ; l’adresse (slug) doit être unique. */
export async function saveArticle(input: { id: string; article: ArticleInput }) {
  return adminAction(
    z.object({ id, article: articleSchema }),
    input,
    async ({ id: articleId, article }) => {
      const db = adminDb();
      await db.runTransaction(async (tx) => {
        const ref = col().doc(articleId);
        const [self, same] = await Promise.all([
          tx.get(ref),
          tx.get(col().where("slug", "==", article.slug).limit(2)),
        ]);
        if (!self.exists) throw new UserError("Article introuvable.");
        if (same.docs.some((d) => d.id !== articleId)) {
          throw new UserError("Cette adresse est déjà utilisée par un autre article.");
        }
        const { publishedAt, coverUrl: _ignored, ...rest } = article;
        tx.update(ref, {
          ...rest,
          publishedAt: dayToTimestamp(publishedAt),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    },
    [TAGS.articles],
  );
}

export async function deleteArticle(input: { id: string }) {
  const r = await adminAction(
    z.object({ id }),
    input,
    async ({ id: articleId }) => {
      await (await mustExist(articleId)).delete();
      await deleteImage(coverPath(articleId));
    },
    [TAGS.articles],
  );
  if (r.ok) redirect("/espace-proprietaire/articles");
  return r;
}

export async function uploadCover(form: FormData) {
  return adminAction(
    z.object({ id, file: z.instanceof(File) }),
    { id: form.get("id"), file: form.get("file") },
    async ({ id: articleId, file }) => {
      const ref = await mustExist(articleId);
      const url = await storeImage(file, coverPath(articleId));
      await ref.update({ coverUrl: url, updatedAt: FieldValue.serverTimestamp() });
      return url;
    },
    [TAGS.articles],
  );
}

export async function removeCover(input: { id: string }) {
  return adminAction(
    z.object({ id }),
    input,
    async ({ id: articleId }) => {
      await (
        await mustExist(articleId)
      ).update({ coverUrl: null, updatedAt: FieldValue.serverTimestamp() });
      await deleteImage(coverPath(articleId));
    },
    [TAGS.articles],
  );
}
