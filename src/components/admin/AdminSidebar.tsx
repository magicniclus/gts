"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Barre latérale : fixe sur grand écran, tiroir repliable au-dessus du contenu sur mobile. */
export function AdminSidebar({ brand, children }: { brand: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const id = useId();
  // Referme le tiroir après chaque navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation avec l’URL
  useEffect(() => setOpen(false), [path]);
  return (
    <aside className="flex max-w-full flex-[0_0_250px] flex-col gap-7 bg-accent-900 px-4 py-7 text-white max-md:flex-[1_1_100%] max-md:gap-4 max-md:py-4">
      <div className="flex items-center justify-between gap-3">
        {brand}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-field px-3 text-sm font-bold text-white hover:bg-white/10 md:hidden"
        >
          <Icon name={open ? "x" : "list"} size={22} />
          Menu
        </button>
      </div>
      <div id={id} className={cx("flex flex-1 flex-col gap-7", !open && "max-md:hidden")}>
        {children}
      </div>
    </aside>
  );
}
