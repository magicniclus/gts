import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Classes communes aux champs (≥ 44 px de haut, rayon 10 px). */
export const fieldClasses = cx(
  "w-full min-h-11 rounded-field border border-divider bg-surface px-3 py-2 text-[15px] text-text",
  "caret-accent placeholder:text-text/65 hover:border-text/45 focus-visible:border-accent focus-visible:outline-offset-0",
  "aria-invalid:border-danger-fg",
);

type FieldProps = {
  id: string;
  label: ReactNode;
  /** Mention après le libellé, ex. « (facultatif) ». */
  optional?: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Libellé + champ + aide + erreur. Le champ enfant doit porter `id`. */
export function Field({ id, label, optional, hint, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-text">
        {label}
        {optional && <span className="font-normal"> {optional}</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 mb-0 text-[13px] text-text/65">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 mb-0 text-[13px] font-semibold text-danger-fg"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={cx(fieldClasses, className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentPropsWithoutRef<"select">) {
  return (
    <select className={cx(fieldClasses, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cx(fieldClasses, "min-h-[90px] resize-y", className)} {...props} />;
}

export function Checkbox({
  label,
  className,
  ...props
}: { label: ReactNode } & Omit<ComponentPropsWithoutRef<"input">, "type">) {
  return (
    <label
      className={cx("flex cursor-pointer items-start gap-3 text-sm leading-normal", className)}
    >
      <input type="checkbox" className="mt-px size-5 flex-none accent-accent" {...props} />
      <span>{label}</span>
    </label>
  );
}
