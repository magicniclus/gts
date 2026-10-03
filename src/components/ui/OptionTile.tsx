import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

/**
 * Tuile de choix du formulaire de devis (états de 04-design.md : survol bordure accent,
 * sélection bordure 1,5 px accent + fond accent-100 + texte accent-800).
 *
 * Variantes, d’après design/Devis.dc.html :
 * - card : grande tuile avec icône, libellé et indication (projet) ;
 * - hero : tuile de la carte du hero (icône + libellé court) ;
 * - tile : tuile verticale icône + libellé (type de bien, délai) ;
 * - year : libellé + indication (date du permis) ;
 * - row : ligne icône + libellé (chauffage, accès) ;
 * - pill : pastille arrondie (surface, gaz, annexes…) ;
 * - box : bouton rectangulaire (oui / non) ;
 * - square : carré de 46 px (nombre de pièces).
 */
export type OptionTileLayout =
  "card" | "hero" | "tile" | "year" | "row" | "pill" | "box" | "square";

type Props = {
  label: string;
  icon?: string;
  hint?: string;
  selected: boolean;
  layout?: OptionTileLayout;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

const LAYOUTS: Record<OptionTileLayout, string> = {
  card: "grid gap-2.5 rounded-card-sm p-5 text-left",
  hero: "flex min-h-[60px] items-center gap-3 rounded-tile px-3.5 py-2.5 text-left text-[15px] leading-tight font-semibold",
  tile: "grid justify-items-start gap-2 rounded-card-sm p-4 text-left text-[15px] font-bold",
  year: "grid gap-0.5 rounded-tile px-3.5 py-3 text-left",
  row: "flex min-h-[52px] items-center gap-2.5 rounded-tile px-3.5 py-2 text-left text-sm font-semibold",
  pill: "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap",
  box: "inline-flex min-h-[46px] items-center rounded-tile px-[22px] text-[15px] font-bold",
  square: "grid size-[46px] place-items-center rounded-tile text-[15px] font-bold",
};

const ICON_SIZES: Record<OptionTileLayout, number> = {
  card: 34,
  hero: 26,
  tile: 28,
  year: 0,
  row: 22,
  pill: 18,
  box: 0,
  square: 0,
};

export function OptionTile({
  label,
  icon,
  hint,
  selected,
  layout = "pill",
  className,
  ...rest
}: Props) {
  const iconSize = ICON_SIZES[layout];
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        "cursor-pointer border-[1.5px] transition-colors hover:border-accent",
        selected
          ? "border-accent bg-accent-100 text-accent-800"
          : "border-divider bg-white text-text",
        LAYOUTS[layout],
        className,
      )}
      {...rest}
    >
      {icon && iconSize > 0 && (
        <Icon name={icon} size={iconSize} className="flex-none text-accent" />
      )}
      {layout === "card" ? (
        <>
          <span className="text-[17px] font-bold">{label}</span>
          {hint && <span className="text-[13px] leading-snug text-text/65">{hint}</span>}
        </>
      ) : layout === "year" ? (
        <>
          <span className="text-[15px] font-bold">{label}</span>
          {hint && <span className="text-xs text-text/62">{hint}</span>}
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
