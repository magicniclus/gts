import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { requireAdmin } from "@/lib/firebase/session";
import { readArticle } from "@/lib/repos/articles";
import { deleteArticle, removeCover, saveArticle, uploadCover } from "../actions";

export default async function ArticleEditPage({
  params,
}: PageProps<"/espace-proprietaire/articles/[id]">) {
  await requireAdmin();
  const article = await readArticle((await params).id);
  if (!article) notFound();
  return (
    <ArticleEditor
      key={article.updatedAt}
      article={article}
      save={saveArticle}
      remove={deleteArticle}
      uploadCover={uploadCover}
      removeCover={removeCover}
    />
  );
}
