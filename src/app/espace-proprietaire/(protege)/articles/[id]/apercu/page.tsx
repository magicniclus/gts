import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/ArticleView";
import { requireAdmin } from "@/lib/firebase/session";
import { readArticle } from "@/lib/repos/articles";

/** Aperçu d’un brouillon (bandeau « Brouillon »), réservé à l’administrateur. */
export default async function ArticlePreviewPage({
  params,
}: PageProps<"/espace-proprietaire/articles/[id]/apercu">) {
  await requireAdmin();
  const article = await readArticle((await params).id);
  if (!article) notFound();
  return (
    <div className="-m-[clamp(24px,3.5vw,48px)] bg-white pb-16">
      <ArticleView article={article} others={[]} />
    </div>
  );
}
