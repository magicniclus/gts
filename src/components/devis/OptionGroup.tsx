import type { ReactNode } from "react";
import { OptionTile, type OptionTileLayout } from "@/components/ui/OptionTile";
import type { DevisOption } from "@/lib/data/devis-options";
import { cx } from "@/lib/cx";

type Common = {
  legend: ReactNode;
  /** Précision sous la légende. */
  hint?: string;
  options: readonly DevisOption[];
  layout?: OptionTileLayout;
  /** Grille : largeur minimale d’une tuile (px) ; sinon tuiles en ligne. */
  min?: number;
  className?: string;
};

type Single = Common & { multi?: false; value: string | undefined; onChange: (v: string) => void };
type Multi = Common & { multi: true; value: readonly string[]; onChange: (v: string[]) => void };

/** Question à choix (unique ou multiple) rendue en tuiles, groupée dans un <fieldset>. */
export function OptionGroup(props: Single | Multi) {
  const { legend, hint, options, layout = "pill", min, className } = props;
  const isOn = (v: string) => (props.multi ? props.value.includes(v) : props.value === v);
  const pick = (v: string) => {
    if (props.multi)
      props.onChange(isOn(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    else props.onChange(v);
  };
  return (
    <fieldset className={cx("m-0 min-w-0 border-0 p-0", className)}>
      <legend className="mb-2.5 p-0 text-sm font-bold">{legend}</legend>
      {hint && <p className="-mt-1.5 mb-2.5 text-[13px] text-text/65">{hint}</p>}
      <div
        className={min ? "grid gap-2.5" : "flex flex-wrap gap-2"}
        style={
          min
            ? { gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }
            : undefined
        }
      >
        {options.map((o) => (
          <OptionTile
            key={o.value}
            layout={layout}
            label={o.label}
            icon={o.icon}
            hint={o.hint}
            selected={isOn(o.value)}
            onClick={() => pick(o.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
