import { DEVIS_STEPS } from "@/lib/data/devis-options";
import { cx } from "@/lib/cx";

/** Les 6 étapes ; une étape n’est accessible que si les précédentes sont valides. */
export function Stepper({
  current,
  valid,
  onGo,
}: {
  current: number;
  valid: readonly boolean[];
  onGo: (i: number) => void;
}) {
  return (
    <ol className="m-0 mt-7 grid list-none grid-cols-6 gap-2 p-0" aria-label="Étapes du devis">
      {DEVIS_STEPS.map((label, i) => {
        const locked = !valid.slice(0, i).every(Boolean);
        const cur = i === current;
        const done = valid[i] && i < current;
        return (
          <li key={label} className="min-w-0">
            <button
              type="button"
              disabled={locked}
              aria-current={cur ? "step" : undefined}
              onClick={() => onGo(i)}
              className="grid min-h-11 w-full cursor-pointer gap-2.5 text-left disabled:cursor-not-allowed"
            >
              <span
                className={cx("h-[5px] rounded-[5px]", cur || done ? "bg-accent" : "bg-accent-200")}
              />
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cx(
                    "grid size-[26px] flex-none place-items-center rounded-full text-xs font-extrabold",
                    cur
                      ? "bg-accent text-white"
                      : done
                        ? "bg-accent-900 text-white"
                        : "bg-white text-text/55",
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cx(
                    "truncate text-sm max-md:sr-only",
                    cur
                      ? "font-extrabold text-accent-900"
                      : locked
                        ? "font-semibold text-text/50"
                        : "font-semibold text-text",
                  )}
                >
                  {label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
