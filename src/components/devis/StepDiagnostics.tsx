import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { DIAGNOSTICS } from "@/lib/data/diagnostics";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/domain/pricing";
import type { Row } from "@/lib/domain/types";
import { StepHeading } from "./StepHeading";

function rowIcon(r: Row): string {
  return r.id === "spanc" ? "drop" : DIAGNOSTICS[r.id].icon;
}

export function StepDiagnostics({
  rows,
  onToggle,
}: {
  rows: readonly Row[];
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <StepHeading
        title="Vos diagnostics"
        intro="Sélection établie selon la réglementation. Ajoutez ou retirez librement."
      />
      {rows.length === 0 ? (
        <p className="mt-[18px] text-[15px]">
          Aucun diagnostic obligatoire détecté. Décrivez votre besoin à l’étape suivante, Guillaume
          vous conseillera.
        </p>
      ) : (
        <ul className="m-0 mt-[22px] grid list-none gap-2.5 p-0">
          {rows.map((r) => {
            const info = r.level === "Info";
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={info ? undefined : r.on}
                  disabled={info}
                  onClick={() => onToggle(r.id)}
                  className={cx(
                    "grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1.5 rounded-card-sm border-[1.5px] px-4 py-3.5 text-left transition-colors",
                    info ? "cursor-default" : "cursor-pointer hover:border-accent",
                    r.on ? "border-accent bg-accent-100" : "border-divider bg-white",
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      "grid size-6 place-items-center rounded-[7px] border-[1.5px] text-white",
                      r.on ? "border-accent bg-accent" : "border-divider bg-white",
                    )}
                  >
                    <Icon name="check" size={15} />
                  </span>
                  <Icon name={rowIcon(r)} size={26} className="text-accent" />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="text-[15px] font-bold">{r.name}</span>
                    <span className="text-[13px] text-text/65">{r.reason}</span>
                  </span>
                  <span className="grid justify-items-end gap-1">
                    <Tag
                      tone={
                        r.level === "Obligatoire"
                          ? "navy"
                          : r.level === "Déjà valide"
                            ? "success"
                            : "neutral"
                      }
                      className={
                        r.level === "Obligatoire" || r.level === "Déjà valide"
                          ? ""
                          : "bg-surface text-text"
                      }
                    >
                      {r.level}
                    </Tag>
                    <span className="text-[13px] font-semibold">
                      {info ? "Par le SPANC" : formatPrice(r.price)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
