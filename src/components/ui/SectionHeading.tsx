import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Kicker } from "./Kicker";

type Props = {
  kicker?: ReactNode;
  title: ReactNode;
  /** Fin du titre, en bleu. */
  highlight?: ReactNode;
  /** Ponctuation après la mise en valeur (souvent « . »). */
  after?: string;
  as?: "h1" | "h2";
  tone?: "onLight" | "onDark";
  size?: "section" | "page" | "block";
  className?: string;
  /** Classes du titre lui-même (ex. largeur en « ch », relative à sa taille de police). */
  titleClassName?: string;
};

const SIZES = {
  section: "text-[clamp(30px,3.6vw,46px)] leading-[1.06] stretch-115 tracking-[-0.02em]",
  page: "text-[clamp(34px,4.6vw,58px)] leading-[1.04] stretch-115 tracking-[-0.025em] text-balance",
  block: "text-[clamp(26px,3vw,36px)] leading-[1.1] stretch-112",
} as const;

export function SectionHeading({
  kicker,
  title,
  highlight,
  after,
  as: Tag = "h2",
  tone = "onLight",
  size = Tag === "h1" ? "page" : "section",
  className,
  titleClassName,
}: Props) {
  const dark = tone === "onDark";
  return (
    <div className={className}>
      {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
      <Tag
        className={cx(
          "m-0 font-heading font-extrabold",
          SIZES[size],
          kicker ? "mt-4" : undefined,
          dark ? "text-white" : "text-accent-900",
          titleClassName,
        )}
      >
        {title}
        {highlight && (
          <>
            {" "}
            <span className={dark ? "text-accent-400" : "text-accent"}>{highlight}</span>
          </>
        )}
        {after}
      </Tag>
    </div>
  );
}
