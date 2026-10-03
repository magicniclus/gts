"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { ActionResult } from "@/lib/admin/result";
import { slugify } from "@/lib/domain/slug";
import {
  ARTICLE_CATEGORIES,
  articleSchema,
  type Article,
  type ArticleInput,
} from "@/lib/schemas/content";
import { ImageUploader } from "./ImageUploader";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useToast } from "./Toast";
import { useSaveForm } from "./useSaveForm";

type Props = {
  article: Article;
  save: (i: { id: string; article: ArticleInput }) => Promise<ActionResult>;
  remove: (i: { id: string }) => Promise<ActionResult>;
  uploadCover: (f: FormData) => Promise<ActionResult<string>>;
  removeCover: (i: { id: string }) => Promise<ActionResult>;
};

/** Éditeur sur 2 colonnes : texte | couverture, publication, voir, supprimer. */
export function ArticleEditor({ article, save, remove, uploadCover, removeCover }: Props) {
  const toast = useToast();
  const [cover, setCover] = useState(article.coverUrl);
  const [published, setPublished] = useState(article.published);
  const [slug, setSlug] = useState(article.slug);
  // L’adresse suit le titre tant qu’elle n’a pas été modifiée à la main (brouillon jamais publié).
  const [autoSlug, setAutoSlug] = useState(
    !article.published && article.slug.startsWith("nouvel-article-"),
  );
  const [pending, start] = useTransition();
  const { id: _id, createdAt: _c, updatedAt: _u, ...values } = article;
  const form = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: values,
  });
  const {
    submit,
    savedAt,
    pending: saving,
    dirty,
  } = useSaveForm(
    form,
    (v) => save({ id: article.id, article: v }),
    article.updatedAt,
    (_d, v) => {
      setPublished(v.published);
      setSlug(v.slug);
    },
  );
  const e = form.formState.errors;
  const title = form.register("title");
  const slugField = form.register("slug");
  const viewHref = published
    ? `/conseils/${slug}`
    : `/espace-proprietaire/articles/${article.id}/apercu`;

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Modifier l’article"
        sub={article.title}
        aside={<SavedLabel savedAt={savedAt} dirty={dirty} />}
      />
      <Link
        href="/espace-proprietaire/articles"
        className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold"
      >
        <Icon name="arrow-left" size={18} />
        Tous les articles
      </Link>
      <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-5">
        <div className="grid min-w-0 gap-[18px] rounded-card bg-white p-6 lg:col-span-2">
          <Field id="art-title" label="Titre" error={e.title?.message}>
            <Input
              id="art-title"
              aria-invalid={e.title ? true : undefined}
              {...title}
              onChange={(ev) => {
                void title.onChange(ev);
                if (autoSlug)
                  form.setValue("slug", slugify(ev.target.value), { shouldDirty: true });
              }}
            />
          </Field>
          <Field id="art-slug" label="Adresse de la page" error={e.slug?.message}>
            <span className="flex items-center gap-1.5">
              <span className="whitespace-nowrap text-text/72">/conseils/</span>
              <Input
                id="art-slug"
                className="min-w-0 flex-1"
                aria-invalid={e.slug ? true : undefined}
                {...slugField}
                onChange={(ev) => {
                  setAutoSlug(false);
                  ev.target.value = slugify(ev.target.value) || ev.target.value.toLowerCase();
                  void slugField.onChange(ev);
                }}
              />
            </span>
          </Field>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[18px]">
            <Field id="art-cat" label="Catégorie">
              <Select id="art-cat" {...form.register("category")}>
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="art-date" label="Date de publication" error={e.publishedAt?.message}>
              <Input id="art-date" type="date" {...form.register("publishedAt")} />
            </Field>
          </div>
          <Field
            id="art-excerpt"
            label="Résumé"
            hint="Affiché sous le titre et dans les résultats Google (150 caractères environ)."
            error={e.excerpt?.message}
          >
            <Textarea
              id="art-excerpt"
              rows={3}
              aria-describedby="art-excerpt-hint"
              {...form.register("excerpt")}
            />
          </Field>
          <Field
            id="art-body"
            label="Contenu"
            hint="Une ligne vide sépare les paragraphes · « ## » en début de ligne crée un intertitre."
            error={e.body?.message}
          >
            <Textarea
              id="art-body"
              rows={18}
              className="min-h-[380px] leading-normal"
              aria-describedby="art-body-hint"
              {...form.register("body")}
            />
          </Field>
          <Field id="art-cover-alt" label="Description de l’image de couverture">
            <Input id="art-cover-alt" {...form.register("coverAlt")} />
          </Field>
        </div>
        <div className="grid min-w-0 gap-4">
          <section
            aria-label="Image de couverture"
            className="grid gap-3.5 rounded-card bg-white p-5"
          >
            <h2 className="m-0 text-sm font-bold">Image de couverture</h2>
            <div className="relative grid aspect-video place-items-center overflow-hidden rounded-tile bg-accent-900 text-accent-400">
              {cover ? (
                <Image src={cover} alt="" fill sizes="360px" className="object-cover" />
              ) : (
                <Icon name="image" size={36} />
              )}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <ImageUploader
                label="Choisir une image"
                maxDim={1600}
                fields={{ id: article.id }}
                upload={uploadCover}
                onUploaded={setCover}
              />
              {cover && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await removeCover({ id: article.id });
                      if (r.ok) {
                        setCover(null);
                        toast("success", "Couverture retirée.");
                      } else toast("error", r.error);
                    })
                  }
                >
                  Retirer
                </Button>
              )}
            </div>
          </section>
          <div className="grid gap-3.5 rounded-card bg-white p-5">
            <Checkbox
              label={<span className="text-[15px] font-bold">Publié sur le site</span>}
              {...form.register("published")}
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Link
              href={viewHref}
              className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold"
              target="_blank"
            >
              {published ? "Voir l’article" : "Voir l’aperçu"}
              <Icon name="arrow-right" />
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Supprimer cet article ?")) return;
                start(async () => {
                  const r = await remove({ id: article.id });
                  if (r && !r.ok) toast("error", r.error);
                });
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 justify-self-start rounded-field px-3 text-sm font-semibold text-danger-fg hover:bg-danger-bg"
            >
              <Icon name="trash" size={18} />
              Supprimer l’article
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
