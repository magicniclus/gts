import { Field, Input, Select } from "@/components/ui/Field";
import { COMMUNES } from "@/lib/data/communes";
import { COPRO, EGOUT, PIECES, SURFACE, TYPE } from "@/lib/data/devis-options";
import { OptionGroup } from "./OptionGroup";
import { StepHeading } from "./StepHeading";
import type { DevisForm, SetField } from "./types";

export function StepBien({ f, set }: { f: DevisForm; set: SetField }) {
  return (
    <>
      <StepHeading title="Parlez-nous du bien" />
      <OptionGroup
        className="mt-6"
        legend="Type de bien"
        options={TYPE}
        layout="tile"
        min={160}
        value={f.type}
        onChange={(v) => set("type", v as DevisForm["type"])}
      />
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        <Field id="dv-commune" label="Commune">
          <Select
            id="dv-commune"
            value={f.commune ?? ""}
            onChange={(e) => set("commune", e.target.value || undefined)}
            className="min-h-[50px] rounded-tile"
          >
            <option value="">Choisir…</option>
            {COMMUNES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.cp})
              </option>
            ))}
          </Select>
        </Field>
        <Field id="dv-adresse" label="Adresse" optional="(facultatif)">
          <Input
            id="dv-adresse"
            autoComplete="street-address"
            value={f.adresse ?? ""}
            onChange={(e) => set("adresse", e.target.value)}
            placeholder="12 rue Paradis"
            className="min-h-[50px] rounded-tile"
          />
        </Field>
      </div>
      <OptionGroup
        className="mt-[22px]"
        legend="Surface habitable"
        options={SURFACE}
        value={f.surface}
        onChange={(v) => set("surface", v as DevisForm["surface"])}
      />
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[22px]">
        <OptionGroup
          legend="Nombre de pièces"
          options={PIECES}
          layout="square"
          value={f.pieces}
          onChange={(v) => set("pieces", v as DevisForm["pieces"])}
        />
        <OptionGroup
          legend="En copropriété ?"
          options={COPRO}
          layout="box"
          value={f.copro}
          onChange={(v) => set("copro", v as DevisForm["copro"])}
        />
      </div>
      {f.projet === "vente" && f.type === "maison" && (
        <OptionGroup
          className="mt-[22px]"
          legend="Maison raccordée au tout-à-l’égout ?"
          options={EGOUT}
          value={f.egout}
          onChange={(v) => set("egout", v as DevisForm["egout"])}
        />
      )}
    </>
  );
}
