import { ArticleList } from "@/components/admin/ArticleList";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/firebase/session";
import { listAllArticles } from "@/lib/repos/articles";
import { createArticle } from "./actions";

export default async function ArticlesAdminPage() {
  await requireAdmin();
  const articles = await listAllArticles();
  return (
    <>
      <PageHeader
        title="Articles"
        sub="Rédigez vos conseils et actualités. Chaque article publié devient une page du site, utile pour le référencement."
      />
      <form
        action={async () => {
          "use server";
          await createArticle();
        }}
        className="mt-7"
      >
        <Button type="submit" icon="plus" iconPosition="start">
          Nouvel article
        </Button>
      </form>
      <ArticleList articles={articles} />
    </>
  );
}
