"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fieldClasses } from "@/components/ui/Field";
import { COMMUNES } from "@/lib/data/communes";
import { cx } from "@/lib/cx";
import { slugify } from "@/lib/domain/slug";
import { CityCard } from "./CityLinkGrid";

const INDEX = COMMUNES.map((c) => ({ c, norm: slugify(`${c.name} ${c.cp}`) }));

export function searchCommunes(query: string, max = 9) {
  const q = slugify(query);
  if (q.length < 2) return null;
  return INDEX.filter((x) => x.norm.includes(q))
    .slice(0, max)
    .map((x) => x.c);
}

/** Recherche de commune par nom ou code postal (accueil). */
export function CommuneSearch({ phone }: { phone: string }) {
  const [q, setQ] = useState("");
  const id = useId();
  const results = searchCommunes(q);
  return (
    <>
      <div className="relative">
        <Icon
          name="magnifying-glass"
          size={20}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-accent"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher votre commune ou code postal"
          aria-label="Rechercher une commune"
          aria-controls={id}
          className={cx(fieldClasses, "min-h-[54px] rounded-tile pl-[46px] text-base")}
        />
      </div>
      <div id={id} aria-live="polite" className="contents">
        {results && results.length > 0 && (
          <ul className="[grid-column:1/-1] m-0 mt-7 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-2.5 p-0">
            {results.map((c) => (
              <li key={c.slug}>
                <CityCard c={c} />
              </li>
            ))}
          </ul>
        )}
        {results && results.length === 0 && (
          <p className="[grid-column:1/-1] mt-5 text-[15px]">
            Commune hors liste ? Appelez le {phone}, Guillaume étudie chaque demande.
          </p>
        )}
      </div>
    </>
  );
}
