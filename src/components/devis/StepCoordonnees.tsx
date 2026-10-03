import { Checkbox, Field, Input } from "@/components/ui/Field";
import { PROFIL } from "@/lib/data/devis-options";
import { CONSENT_TEXT } from "@/lib/leads/constants";
import { OptionGroup } from "./OptionGroup";
import { StepHeading } from "./StepHeading";
import type { DevisForm, SetField } from "./types";

export function StepCoordonnees({
  f,
  set,
  errors,
}: {
  f: DevisForm;
  set: SetField;
  errors: Record<string, string>;
}) {
  const err = (k: string) => errors[`contact.${k}`];
  return (
    <>
      <StepHeading title="Où vous envoyer le devis ?" />
      <OptionGroup
        className="mt-6"
        legend="Vous êtes"
        options={PROFIL}
        value={f.profil || undefined}
        onChange={(v) => set("profil", v as DevisForm["profil"])}
      />
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
        <Field id="dv-nom" label="Nom et prénom" error={err("nom")}>
          <Input
            id="dv-nom"
            autoComplete="name"
            required
            value={f.nom}
            onChange={(e) => set("nom", e.target.value)}
            aria-invalid={err("nom") ? true : undefined}
            aria-describedby={err("nom") ? "dv-nom-error" : undefined}
            className="min-h-[50px] rounded-tile"
          />
        </Field>
        <Field id="dv-tel" label="Téléphone" error={err("tel")}>
          <Input
            id="dv-tel"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={f.tel}
            onChange={(e) => set("tel", e.target.value)}
            aria-invalid={err("tel") ? true : undefined}
            aria-describedby={err("tel") ? "dv-tel-error" : undefined}
            className="min-h-[50px] rounded-tile"
          />
        </Field>
        <Field id="dv-mail" label="E-mail" optional="(facultatif)" error={err("email")}>
          <Input
            id="dv-mail"
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={err("email") ? "dv-mail-error" : undefined}
            className="min-h-[50px] rounded-tile"
          />
        </Field>
      </div>
      <Checkbox
        className="mt-5"
        label={CONSENT_TEXT}
        checked={f.consent}
        onChange={(e) => set("consent", e.target.checked)}
      />
    </>
  );
}
