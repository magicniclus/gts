import { Field, Textarea } from "@/components/ui/Field";
import { ACCES, CRENEAU, DELAI } from "@/lib/data/devis-options";
import { OptionGroup } from "./OptionGroup";
import { StepHeading } from "./StepHeading";
import type { DevisForm, SetField } from "./types";

export function StepRendezVous({ f, set }: { f: DevisForm; set: SetField }) {
  return (
    <>
      <StepHeading title="Quand intervenir ?" />
      <OptionGroup
        className="mt-6"
        legend="Délai souhaité"
        options={DELAI}
        layout="tile"
        min={160}
        value={f.delai}
        onChange={(v) => set("delai", v as DevisForm["delai"])}
      />
      <OptionGroup
        className="mt-[22px]"
        legend="Créneau préféré"
        options={CRENEAU}
        value={f.creneau}
        onChange={(v) => set("creneau", v as DevisForm["creneau"])}
      />
      <OptionGroup
        className="mt-[22px]"
        legend="Accès au bien"
        options={ACCES}
        layout="row"
        min={210}
        value={f.acces}
        onChange={(v) => set("acces", v as DevisForm["acces"])}
      />
      <Field id="dv-msg" label="Précisions" optional="(facultatif)" className="mt-[22px]">
        <Textarea
          id="dv-msg"
          rows={3}
          maxLength={2000}
          value={f.message ?? ""}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Digicode, date du compromis, travaux prévus…"
          className="rounded-tile"
        />
      </Field>
    </>
  );
}
