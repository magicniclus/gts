import { Icon } from "@/components/ui/Icon";

export type Fact = { icon: string; k: string; v: string };

/** Carte blanche des 4 faits clés (distance, délai, tarif, secteur…). */
export function FactsRow({ facts }: { facts: readonly Fact[] }) {
  return (
    <ul className="m-0 list-none rounded-hero bg-white px-6 py-2 text-text shadow-hero">
      {facts.map((x, i) => (
        <li
          key={x.k}
          className={`flex items-center gap-3.5 py-4 ${i < facts.length - 1 ? "border-b border-divider" : ""}`}
        >
          <span className="grid size-[42px] flex-none place-items-center rounded-tile bg-accent-100 text-accent">
            <Icon name={x.icon} size={22} />
          </span>
          <span className="grid gap-0.5">
            <span className="text-xs font-bold tracking-[0.12em] text-text/60 uppercase">
              {x.k}
            </span>
            <span className="text-base font-bold">{x.v}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
