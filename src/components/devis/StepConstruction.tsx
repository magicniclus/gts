import { ANNEE, ANNEXES, CHAUFFAGE, CLASSE, DEJA, ELEC, GAZ } from "@/lib/data/devis-options";
import { OptionGroup } from "./OptionGroup";
import { StepHeading } from "./StepHeading";
import type { DevisForm, SetField } from "./types";

/** La question « classe » n’apparaît que si l’audit énergétique est possible. */
export function asksClasse(f: Pick<DevisForm, "projet" | "type" | "copro">): boolean {
  return (
    f.projet === "vente" && (f.type === "maison" || f.type === "immeuble") && f.copro !== "oui"
  );
}

export function StepConstruction({ f, set }: { f: DevisForm; set: SetField }) {
  return (
    <>
      <StepHeading
        title="Construction et équipements"
        intro={
          <>
            La date du permis détermine <strong>amiante</strong> et <strong>plomb</strong> ; l’âge
            des installations, <strong>gaz</strong> et <strong>électricité</strong>.
          </>
        }
      />
      <OptionGroup
        className="mt-6"
        legend="Date du permis de construire"
        options={ANNEE}
        layout="year"
        min={180}
        value={f.annee}
        onChange={(v) => set("annee", v as DevisForm["annee"])}
      />
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[22px]">
        <OptionGroup
          legend="Installation gaz"
          options={GAZ}
          value={f.gaz}
          onChange={(v) => set("gaz", v as DevisForm["gaz"])}
        />
        <OptionGroup
          legend="Installation électrique"
          options={ELEC}
          value={f.elec}
          onChange={(v) => set("elec", v as DevisForm["elec"])}
        />
      </div>
      <OptionGroup
        className="mt-[22px]"
        legend="Chauffage principal"
        options={CHAUFFAGE}
        layout="row"
        min={140}
        value={f.chauffage}
        onChange={(v) => set("chauffage", v as DevisForm["chauffage"])}
      />
      <OptionGroup
        className="mt-[22px]"
        legend={
          <>
            Annexes à inclure <span className="font-normal">(plusieurs choix)</span>
          </>
        }
        options={ANNEXES}
        multi
        value={f.annexes}
        onChange={(v) => set("annexes", v as DevisForm["annexes"])}
      />
      {asksClasse(f) && (
        <OptionGroup
          className="mt-[22px]"
          legend="Classe du DPE actuel (pour l’audit énergétique)"
          options={CLASSE}
          value={f.classe}
          onChange={(v) => set("classe", v as DevisForm["classe"])}
        />
      )}
      <OptionGroup
        className="mt-[22px]"
        legend="Diagnostics déjà en votre possession et encore valides"
        hint="Inutile de les refaire : ils sont retirés du devis."
        options={DEJA}
        multi
        value={f.deja}
        onChange={(v) => set("deja", v as DevisForm["deja"])}
      />
    </>
  );
}
