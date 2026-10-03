"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { ADMIN_TABS } from "./admin-tabs";

/** Onglets de la barre latérale ; badge jaune du nombre de nouvelles demandes. */
export function AdminNav({ newLeads }: { newLeads: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Espace propriétaire" className="grid gap-1">
      {ADMIN_TABS.map((t) => {
        const section = t.href.split("/").slice(0, 3).join("/");
        const active = path === t.href || path.startsWith(`${section}/`) || path === section;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex min-h-[46px] items-center gap-3 rounded-field px-3.5 text-[15px] font-semibold hover:bg-white/10 hover:text-white",
              active ? "bg-white/14 text-white" : "text-white/74",
            )}
          >
            <Icon name={t.icon} size={20} className="text-accent-400" />
            <span className="flex-1">{t.label}</span>
            {t.label === "Demandes" && newLeads > 0 && (
              <span className="grid h-[22px] min-w-[22px] place-items-center rounded-pill bg-accent-2 px-1.5 text-xs font-extrabold text-accent-900">
                <span className="sr-only">Nouvelles demandes : </span>
                {newLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
