import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type TagTone = "accent" | "navy" | "success" | "warning" | "neutral" | "danger" | "soft";

const TONES: Record<TagTone, string> = {
  accent: "bg-accent text-white",
  navy: "bg-accent-900 text-white",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  neutral: "bg-divider text-neutral-fg",
  danger: "bg-danger-bg text-danger-fg",
  soft: "bg-accent-100 text-accent-800",
};

/** Pastille : niveau d’obligation, statut d’un lead ou d’un article. */
export function Tag({
  tone = "neutral",
  children,
  className,
}: {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs leading-none font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const StatusPill = Tag;
