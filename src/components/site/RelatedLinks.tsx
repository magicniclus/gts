import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type L = { name: string; href: string; icon?: string };

/** Liens connexes (autres diagnostics) et communes voisines en pastilles. */
export function RelatedLinks({
  title,
  links,
  neighbors,
}: {
  title: string;
  links: readonly L[];
  neighbors?: readonly L[];
}) {
  return (
    <div className="grid gap-8">
      <nav aria-label={title}>
        <h3 className="m-0 border-b-2 border-accent-900 pb-2.5 text-[15px] font-extrabold">
          {title}
        </h3>
        <ul className="m-0 mt-3 grid list-none gap-1 p-0">
          {links.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                className="flex min-h-11 items-center gap-2.5 py-2 text-[15px] font-semibold text-text hover:text-accent"
              >
                {o.icon && <Icon name={o.icon} size={20} className="text-accent" />}
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {neighbors && neighbors.length > 0 && (
        <nav aria-label="Communes voisines">
          <h3 className="m-0 border-b-2 border-accent-900 pb-2.5 text-[15px] font-extrabold">
            Communes voisines
          </h3>
          <ul className="m-0 mt-3.5 flex list-none flex-wrap gap-2 p-0">
            {neighbors.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-flex min-h-11 items-center rounded-pill bg-accent-100 px-3 text-sm font-semibold text-accent-700 hover:bg-accent-200 hover:text-accent-800"
                >
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
