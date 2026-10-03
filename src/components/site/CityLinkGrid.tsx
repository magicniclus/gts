import Link from "next/link";
import type { Commune } from "@/lib/data/types";
import { kmLabel } from "@/lib/domain/city-content";
import { routes } from "@/lib/domain/routes";

/** Carte commune : nom, code postal, distance, liens DPE / Amiante / Plomb. */
export function CityCard({ c }: { c: Commune }) {
  return (
    <div className="rounded-card-sm bg-surface px-[18px] py-3.5">
      <div className="font-bold">
        {c.name}{" "}
        <span className="text-sm font-normal text-text/65">
          {c.cp} · {kmLabel(c)}
        </span>
      </div>
      <div className="mt-1.5 flex gap-4 text-sm font-semibold">
        <Link href={routes.city("dpe", c.slug)} aria-label={`DPE à ${c.name}`}>
          DPE
        </Link>
        <Link href={routes.city("amiante", c.slug)} aria-label={`Amiante à ${c.name}`}>
          Amiante
        </Link>
        <Link href={routes.city("plomb", c.slug)} aria-label={`Plomb à ${c.name}`}>
          Plomb
        </Link>
      </div>
    </div>
  );
}

export function CityLinkGrid({
  communes,
  min = 270,
}: {
  communes: readonly Commune[];
  min?: number;
}) {
  return (
    <ul
      className="m-0 grid list-none gap-2.5 p-0"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}
    >
      {communes.map((c) => (
        <li key={c.slug}>
          <CityCard c={c} />
        </li>
      ))}
    </ul>
  );
}
