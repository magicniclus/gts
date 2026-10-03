import Link from "next/link";
import { COMMUNES, SECTEURS, SECTEUR_IDS } from "@/lib/data/lookup";
import { routes } from "@/lib/domain/routes";

/** Secteurs de l’accueil : 8 communes par secteur (pages DPE), puis lien vers les zones. */
export function SectorList({ max = 8 }: { max?: number }) {
  return (
    <div className="mt-11 grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-x-8 gap-y-9">
      {SECTEUR_IDS.map((s) => {
        const cities = COMMUNES.filter((c) => c.secteur === s);
        return (
          <div key={s}>
            <h3 className="m-0 flex justify-between border-b-2 border-accent-900 pb-2.5 text-[15px] font-extrabold tracking-[0.02em]">
              <span>{SECTEURS[s]}</span>
              <span className="font-bold text-accent">{cities.length}</span>
            </h3>
            <ul className="m-0 mt-3 grid list-none gap-0.5 p-0 text-[15px] leading-[1.75]">
              {cities.slice(0, max).map((c) => (
                <li key={c.slug}>
                  <Link href={routes.city("dpe", c.slug)} className="text-text hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
              {cities.length > max && (
                <li>
                  <Link href={routes.zones()} className="font-bold">
                    + {cities.length - max} communes
                  </Link>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
