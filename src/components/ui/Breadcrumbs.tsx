import Link from "next/link";
import { cx } from "@/lib/cx";
import { breadcrumbList } from "@/lib/seo/jsonld";
import { JsonLd } from "./JsonLd";

export type BreadcrumbItem = { name: string; href?: string };

/** Fil d’Ariane ; le dernier élément est la page courante. Publie le JSON-LD BreadcrumbList. */
export function Breadcrumbs({
  items,
  tone = "onDark",
  currentPath,
}: {
  items: readonly BreadcrumbItem[];
  tone?: "onDark" | "onLight";
  /** Chemin de la page courante, pour le JSON-LD. */
  currentPath: string;
}) {
  const dark = tone === "onDark";
  return (
    <>
      <nav aria-label="Fil d’Ariane">
        <ol
          className={cx(
            "m-0 flex list-none flex-wrap gap-2 p-0 text-sm",
            dark ? "text-white/70" : "text-text/65",
          )}
        >
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${item.name}-${i}`} className="flex gap-2">
                {last || !item.href ? (
                  <span
                    aria-current={last ? "page" : undefined}
                    className={dark ? "text-white" : "text-text"}
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className={
                        dark
                          ? "text-white/80 hover:text-white"
                          : "text-accent hover:text-accent-600"
                      }
                    >
                      {item.name}
                    </Link>
                    <span aria-hidden>›</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbList(items, currentPath)} />
    </>
  );
}
