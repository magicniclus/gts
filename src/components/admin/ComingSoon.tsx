import { PageHeader } from "./PageHeader";

/** Onglet pas encore construit (étape 9). */
export function ComingSoon({ title }: { title: string }) {
  return <PageHeader title={title} sub="Cet onglet arrive bientôt." />;
}
