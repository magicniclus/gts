import type { ReactNode } from "react";

/** Titre et sous-titre de l’onglet ; à droite, l’état d’enregistrement ou des actions. */
export function PageHeader({
  title,
  sub,
  aside,
}: {
  title: string;
  sub: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-[640px]">
        <h1 className="m-0 font-heading text-[clamp(28px,3vw,38px)] leading-[1.08] font-extrabold tracking-[-0.02em] text-accent-900 stretch-112">
          {title}
        </h1>
        <p className="mt-2 mb-0 text-[15px] leading-normal text-text/72">{sub}</p>
      </div>
      {aside}
    </div>
  );
}
