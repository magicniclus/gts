import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Sur-titre : trait de 28 px puis capitales espacées. */
export function Kicker({
  tone = "onLight",
  children,
  className,
}: {
  tone?: "onLight" | "onDark";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-3 text-[13px] font-bold tracking-[0.18em] uppercase",
        tone === "onDark" ? "text-accent-400" : "text-accent",
        className,
      )}
    >
      <span aria-hidden className="h-0.5 w-7 bg-current" />
      {children}
    </span>
  );
}
