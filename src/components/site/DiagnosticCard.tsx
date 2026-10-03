import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export type DiagnosticCardTheme = "navy" | "blue" | "light" | "white";

const THEMES: Record<
  DiagnosticCardTheme,
  { card: string; icon: string; chip: string; line: string; arrow: string }
> = {
  navy: {
    card: "bg-accent-900 text-white hover:text-white",
    icon: "text-accent-400",
    chip: "bg-white/12 text-white",
    line: "border-white/16",
    arrow: "bg-accent text-white",
  },
  blue: {
    card: "bg-accent text-white hover:text-white",
    icon: "text-white",
    chip: "bg-white/18 text-white",
    line: "border-white/24",
    arrow: "bg-white text-accent",
  },
  light: {
    card: "bg-accent-100 text-accent-900 hover:text-accent-900",
    icon: "text-accent",
    chip: "bg-white text-accent-700",
    line: "border-accent-200",
    arrow: "bg-accent-900 text-white",
  },
  white: {
    card: "border border-divider bg-white text-text hover:border-accent-300 hover:text-text hover:shadow-[0_10px_28px_-16px_rgb(10_26_72/0.3)]",
    icon: "text-accent",
    chip: "",
    line: "",
    arrow: "text-accent",
  },
};

type Props = {
  href: string;
  name: string;
  icon: string;
  when: string;
  priceLabel: string;
  /** Nom court (cartes vedettes). */
  short?: string;
  valid?: string;
  theme?: DiagnosticCardTheme;
  featured?: boolean;
};

/** Carte diagnostic : blanche minimaliste (grille) ou vedette (navy, bleue, claire). */
export function DiagnosticCard({
  href,
  name,
  icon,
  when,
  priceLabel,
  short,
  valid,
  theme = "white",
  featured,
}: Props) {
  const t = THEMES[theme];
  if (!featured) {
    return (
      <Link
        href={href}
        className={cx(
          "flex w-full flex-col rounded-card-sm px-5 pt-5 pb-4 transition-[border-color,box-shadow]",
          t.card,
        )}
      >
        <span className="flex items-center gap-3.5">
          <Icon name={icon} size={30} className={cx("flex-none", t.icon)} />
          <span className="text-[17px] leading-tight font-bold">{name}</span>
        </span>
        <span className="mt-2.5 text-sm leading-normal text-text/70">{when}</span>
        <span className="mt-auto flex items-center justify-between gap-3 pt-3.5">
          <span className="text-sm font-bold whitespace-nowrap text-accent-700">{priceLabel}</span>
          <Icon name="arrow-right" size={18} className="text-accent" />
        </span>
      </Link>
    );
  }
  return (
    <Link href={href} className={cx("flex w-full flex-col gap-4 rounded-card p-6", t.card)}>
      <span className="flex items-start justify-between gap-3">
        <Icon name={icon} size={40} className={t.icon} />
        <span className={cx("rounded-pill px-3 py-1.5 text-[13px] font-bold", t.chip)}>
          {priceLabel}
        </span>
      </span>
      <span>
        <span className="block font-heading text-2xl font-extrabold stretch-112">
          {short ?? name}
        </span>
        <span className="mt-1 block text-sm opacity-80">{name}</span>
      </span>
      <span
        className={cx(
          "mt-auto flex items-center justify-between gap-3 border-t pt-4 text-sm",
          t.line,
        )}
      >
        <span>
          {when}
          {valid && <span className="block opacity-75">Validité : {valid}</span>}
        </span>
        <span className={cx("grid size-10 flex-none place-items-center rounded-full", t.arrow)}>
          <Icon name="arrow-right" size={18} />
        </span>
      </span>
    </Link>
  );
}
