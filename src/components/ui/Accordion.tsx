import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

/** Question / réponse repliable, en <details> natif (aucun JavaScript). */
export function Accordion({
  question,
  children,
  surface = "white",
  size = "md",
}: {
  question: ReactNode;
  children: ReactNode;
  surface?: "white" | "transparent";
  size?: "md" | "lg";
}) {
  return (
    <details
      className={cx(
        "group rounded-card-sm border border-divider px-[22px] py-[18px]",
        surface === "white" && "bg-white",
      )}
    >
      <summary
        className={cx(
          "flex items-center justify-between gap-5 leading-[1.35] font-bold",
          size === "lg" ? "text-[17px]" : "text-base",
        )}
      >
        <span>{question}</span>
        <Icon
          name="plus"
          size={20}
          className="flex-none text-accent transition-transform duration-200 group-open:rotate-45"
        />
      </summary>
      <div className="mt-3 text-[15px] leading-[1.65] text-text/78">{children}</div>
    </details>
  );
}
