"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { ActionResult } from "@/lib/admin/result";
import { contactSchema, type ContactSettings } from "@/lib/schemas/settings";
import { PageHeader } from "./PageHeader";
import { SavedLabel } from "./SavedLabel";
import { useSaveForm } from "./useSaveForm";

const FIELDS: {
  k: keyof ContactSettings;
  label: string;
  type?: string;
  placeholder?: string;
  auto?: string;
}[] = [
  { k: "phone", label: "Téléphone", type: "tel", auto: "tel" },
  { k: "email", label: "E-mail", type: "email", auto: "email" },
  { k: "hours", label: "Horaires" },
  {
    k: "adresse",
    label: "Adresse professionnelle",
    placeholder: "12 rue …, 13008 Marseille",
    auto: "street-address",
  },
  { k: "siret", label: "SIRET", placeholder: "123 456 789 00012" },
  {
    k: "certification",
    label: "Certification",
    placeholder: "Organisme certificateur, n° de certificat",
  },
  { k: "assurance", label: "Assurance RC Pro", placeholder: "Assureur, n° de police" },
];

export function ContactForm({
  initial,
  updatedAt,
  save,
}: {
  initial: ContactSettings;
  updatedAt: string | null;
  save: (v: ContactSettings) => Promise<ActionResult>;
}) {
  const form = useForm<ContactSettings>({
    resolver: zodResolver(contactSchema),
    defaultValues: initial,
  });
  const { submit, savedAt, pending, dirty } = useSaveForm(form, save, updatedAt);
  const e = form.formState.errors;
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Coordonnées"
        sub="Téléphone, e-mail et horaires affichés sur tout le site."
        aside={<SavedLabel savedAt={savedAt} dirty={dirty} />}
      />
      <div className="mt-7 grid max-w-[560px] gap-[18px] rounded-card bg-white p-6">
        {FIELDS.map((f) => {
          const id = `contact-${f.k}`;
          const err = e[f.k]?.message;
          return (
            <Field key={f.k} id={id} label={f.label} error={err}>
              <Input
                id={id}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                autoComplete={f.auto}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `${id}-error` : undefined}
                {...form.register(f.k)}
              />
            </Field>
          );
        })}
        <p className="m-0 text-sm leading-normal text-text/70">
          Mis à jour dans l’en-tête, le pied de page, les boutons d’appel, les pages légales et les
          données structurées Google. L’e-mail est aussi l’adresse de réception des demandes de
          devis.
        </p>
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
