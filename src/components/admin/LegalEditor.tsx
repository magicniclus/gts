"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { ActionResult } from "@/lib/admin/result";
import { legalPageSchema, type LegalDoc } from "@/lib/schemas/content";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useSaveForm } from "./useSaveForm";

const TABS: { doc: LegalDoc; label: string }[] = [
  { doc: "mentions-legales", label: "Mentions légales" },
  { doc: "cgv", label: "CGV" },
  { doc: "confidentialite", label: "Confidentialité" },
];

type Values = { title: string; body: string };

export function LegalEditor({
  doc,
  initial,
  updatedAt,
  save,
}: {
  doc: LegalDoc;
  initial: Values;
  updatedAt: string | null;
  save: (i: Values & { doc: string }) => Promise<ActionResult>;
}) {
  const form = useForm<Values>({ resolver: zodResolver(legalPageSchema), defaultValues: initial });
  const { submit, savedAt, pending, dirty } = useSaveForm(
    form,
    (v) => save({ ...v, doc }),
    updatedAt,
  );
  const e = form.formState.errors;
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Pages légales"
        sub="Mentions légales, conditions générales de vente et politique de confidentialité."
        aside={<SavedLabel savedAt={savedAt} dirty={dirty} />}
      />
      <nav aria-label="Pages légales" className="mt-7 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.doc}
            href={`/espace-proprietaire/pages-legales/${t.doc}`}
            aria-current={t.doc === doc ? "page" : undefined}
            className={cx(
              "inline-flex min-h-11 items-center rounded-pill border-[1.5px] px-4 text-sm font-bold hover:border-accent",
              t.doc === doc
                ? "border-accent bg-accent-100 text-accent-800"
                : "border-divider bg-white text-text",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 grid gap-[18px] rounded-card bg-white p-6">
        <Field id="legal-title" label="Titre de la page" error={e.title?.message}>
          <Input
            id="legal-title"
            aria-invalid={e.title ? true : undefined}
            {...form.register("title")}
          />
        </Field>
        <Field
          id="legal-body"
          label="Contenu"
          hint="Une ligne vide sépare les paragraphes · « ## » en début de ligne crée un intertitre · {telephone}, {email}, {adresse}, {siret}, {certification} et {assurance} sont remplacés par les valeurs de l’onglet Coordonnées."
          error={e.body?.message}
        >
          <Textarea
            id="legal-body"
            rows={18}
            className="min-h-[380px] leading-normal"
            aria-describedby="legal-body-hint"
            {...form.register("body")}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Link
            href={`/${doc}`}
            target="_blank"
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold"
          >
            Voir la page publiée
            <Icon name="arrow-right" />
          </Link>
        </div>
      </div>
    </form>
  );
}
