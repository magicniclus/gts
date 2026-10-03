import { LOC, NATURE, PROJET } from "@/lib/data/devis-options";
import { OptionGroup } from "./OptionGroup";
import { StepHeading } from "./StepHeading";
import type { DevisForm, SetField } from "./types";

export function StepProjet({ f, set }: { f: DevisForm; set: SetField }) {
  return (
    <>
      <StepHeading
        title="Quel est votre projet ?"
        intro="Les obligations changent selon qu’il s’agit d’une vente, d’une location ou de travaux."
      />
      <OptionGroup
        className="mt-6"
        legend={<span className="sr-only">Votre projet</span>}
        options={PROJET}
        layout="card"
        min={220}
        value={f.projet}
        onChange={(v) => set("projet", v as DevisForm["projet"])}
      />
      {f.projet === "location" && (
        <OptionGroup
          className="mt-[22px]"
          legend="Type de location"
          options={LOC}
          value={f.loc}
          onChange={(v) => set("loc", v as DevisForm["loc"])}
        />
      )}
      {f.projet === "travaux" && (
        <OptionGroup
          className="mt-[22px]"
          legend="Nature du chantier"
          options={NATURE}
          value={f.nature}
          onChange={(v) => set("nature", v as DevisForm["nature"])}
        />
      )}
    </>
  );
}
