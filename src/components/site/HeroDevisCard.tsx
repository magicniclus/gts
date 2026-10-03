"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OptionTile } from "@/components/ui/OptionTile";
import { Select } from "@/components/ui/Field";
import { COMMUNES } from "@/lib/data/communes";
import { PROJET, TYPE } from "@/lib/data/devis-options";
import { saveDraft } from "@/lib/devis-draft";
import { routes } from "@/lib/domain/routes";

/** Carte « Devis gratuit en 2 min » du hero : étape 1, puis /devis à l’étape 2. */
export function HeroDevisCard() {
  const router = useRouter();
  const [projet, setProjet] = useState("");
  const [type, setType] = useState("");
  const [commune, setCommune] = useState("");

  const go = () => {
    saveDraft({ projet, type, commune });
    router.push(routes.devis());
  };

  return (
    <div className="rounded-hero bg-white p-[clamp(22px,2.4vw,32px)] text-text shadow-hero">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 font-heading text-[22px] font-extrabold text-accent-900 stretch-112">
          Devis gratuit en 2 min
        </h2>
        <span className="text-[13px] font-semibold text-accent">Étape 1 sur 6</span>
      </div>
      <div className="mt-3.5 mb-[22px] h-1 rounded bg-accent-100" aria-hidden>
        <div className="h-1 w-[16%] rounded bg-accent" />
      </div>
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2.5 p-0 text-sm font-bold">Votre projet</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {PROJET.map((o) => (
            <OptionTile
              key={o.value}
              layout="hero"
              icon={o.icon}
              label={o.short ?? o.label}
              selected={projet === o.value}
              onClick={() => setProjet(o.value)}
            />
          ))}
        </div>
      </fieldset>
      <fieldset className="m-0 mt-5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-sm font-bold">Type de bien</legend>
        <div className="flex flex-wrap gap-2">
          {TYPE.map((o) => (
            <OptionTile
              key={o.value}
              layout="pill"
              icon={o.icon}
              label={o.label}
              selected={type === o.value}
              onClick={() => setType(o.value)}
            />
          ))}
        </div>
      </fieldset>
      <label htmlFor="hero-commune" className="mt-5 mb-2.5 block text-sm font-bold">
        Commune du bien
      </label>
      <div className="relative">
        <Icon
          name="map-pin"
          size={20}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-accent"
        />
        <Select
          id="hero-commune"
          value={commune}
          onChange={(e) => setCommune(e.target.value)}
          className="min-h-[50px] rounded-tile pl-11"
        >
          <option value="">Choisir une commune…</option>
          {COMMUNES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} ({c.cp})
            </option>
          ))}
        </Select>
      </div>
      <Button
        size="xl"
        block
        icon="arrow-right"
        className="mt-[22px]"
        disabled={!projet}
        onClick={go}
      >
        Voir mes diagnostics obligatoires
      </Button>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-[13px] text-text/68">
        <span>Sans engagement</span>
        <span aria-hidden>·</span>
        <span>Réponse sous 2 h ouvrées</span>
      </div>
    </div>
  );
}
