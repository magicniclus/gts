"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { ActionResult } from "@/lib/admin/result";
import { fillPlaceholders } from "@/lib/domain/markdown-lite";
import { heroSchema, type HeroSettings } from "@/lib/schemas/settings";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useSaveForm } from "./useSaveForm";

/** Texte du haut de la page d’accueil, avec aperçu navy en direct. */
export function HeroEditor({
  initial,
  updatedAt,
  communes,
  save,
}: {
  initial: HeroSettings;
  updatedAt: string | null;
  communes: number;
  save: (v: HeroSettings) => Promise<ActionResult>;
}) {
  const form = useForm<HeroSettings>({ resolver: zodResolver(heroSchema), defaultValues: initial });
  const { submit, savedAt, pending, dirty } = useSaveForm(form, save, updatedAt);
  const v = useWatch({ control: form.control });
  const e = form.formState.errors;
  const reg = (k: keyof HeroSettings, id: string) => ({
    id,
    "aria-invalid": e[k] ? true : undefined,
    "aria-describedby": e[k] ? `${id}-error` : undefined,
    ...form.register(k),
  });
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Page d’accueil"
        sub="Le texte du haut de page. Les modifications sont visibles sur le site dès l’enregistrement."
        aside={<SavedLabel savedAt={savedAt} dirty={dirty} />}
      />
      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-6">
        <div className="grid gap-[18px] rounded-card bg-white p-6">
          <Field id="hero-kicker" label="Surtitre" error={e.kicker?.message}>
            <Input {...reg("kicker", "hero-kicker")} />
          </Field>
          <Field id="hero-title" label="Titre" error={e.title?.message}>
            <Input {...reg("title", "hero-title")} />
          </Field>
          <Field id="hero-highlight" label="Fin du titre, en bleu" error={e.highlight?.message}>
            <Input {...reg("highlight", "hero-highlight")} />
          </Field>
          <Field
            id="hero-intro"
            label="Texte d’introduction"
            hint="{communes} est remplacé par le nombre de communes desservies."
            error={e.intro?.message}
          >
            <Textarea rows={4} className="min-h-[110px]" {...reg("intro", "hero-intro")} />
          </Field>
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
        <div
          className="rounded-card bg-accent-900 p-8 text-white"
          aria-label="Aperçu"
          role="region"
        >
          <div className="mb-5 text-xs font-bold tracking-[0.16em] text-white/55 uppercase">
            Aperçu
          </div>
          <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] text-accent-400 uppercase">
            <span aria-hidden className="h-0.5 w-[22px] bg-current" />
            {v.kicker}
          </span>
          <div className="mt-3.5 text-[34px] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance stretch-118">
            {v.title} <span className="text-accent-400">{v.highlight}</span>
          </div>
          <p className="mt-4 mb-0 text-[15px] leading-relaxed text-white/82">
            {fillPlaceholders(v.intro ?? "", { communes })}
          </p>
        </div>
      </div>
    </form>
  );
}
