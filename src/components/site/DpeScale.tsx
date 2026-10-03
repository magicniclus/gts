import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/lib/cx";
import { routes } from "@/lib/domain/routes";

const SCALE = [
  { l: "A", range: "≤ 70", cls: "bg-dpe-a text-white", status: null },
  { l: "B", range: "71 – 110", cls: "bg-dpe-b text-white", status: null },
  { l: "C", range: "111 – 180", cls: "bg-dpe-c text-text", status: null },
  { l: "D", range: "181 – 250", cls: "bg-dpe-d text-text", status: null },
  { l: "E", range: "251 – 330", cls: "bg-dpe-e text-text", status: "Interdit en 2034" },
  { l: "F", range: "331 – 420", cls: "bg-dpe-f text-white", status: "Interdit en 2028" },
  { l: "G", range: "> 420", cls: "bg-dpe-g text-white", status: "Interdit depuis 2025" },
] as const;

/** Focus DPE : texte + échelle A–G avec les interdictions de location. */
export function DpeScale() {
  return (
    <section className="bg-surface">
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-x-[clamp(32px,6vw,96px)] gap-y-12 section-y">
        <div>
          <SectionHeading
            kicker="Focus DPE"
            title="Classé F ou G ?"
            highlight="Votre bail est en jeu."
          />
          <p className="mt-5 mb-0 max-w-[52ch] text-[17px] leading-[1.65] text-text/80">
            Depuis le 1<sup>er</sup> janvier 2025, un logement classé <strong>G</strong> ne peut
            plus être mis en location. Les <strong>F</strong> suivront en 2028, les{" "}
            <strong>E</strong> en 2034. Un DPE juste, c’est la base de toute décision.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={routes.diagnostic("dpe")}>Tout savoir sur le DPE</Button>
            <Button href={routes.diagnostic("audit")} variant="secondary">
              Audit énergétique
            </Button>
          </div>
        </div>
        <figure className="m-0 rounded-hero bg-white p-[clamp(20px,3vw,32px)] shadow-[0_18px_50px_-24px_rgb(10_26_72/0.25)]">
          <figcaption className="mb-3.5 flex justify-between text-[13px] font-semibold text-text/65">
            <span>Consommation (kWh/m²/an)</span>
            <span>Location</span>
          </figcaption>
          <ol className="m-0 grid list-none gap-[7px] p-0">
            {SCALE.map((c, i) => (
              <li key={c.l} className="flex items-center gap-3">
                <span
                  className={cx(
                    "flex h-[38px] min-w-[120px] items-center justify-between pr-[26px] pl-3.5 text-[13px] font-semibold [clip-path:polygon(0_0,calc(100%-16px)_0,100%_50%,calc(100%-16px)_100%,0_100%)]",
                    c.cls,
                  )}
                  style={{ width: `${46 + i * 8}%` }}
                >
                  <span>{c.range}</span>
                  <strong className="text-xl font-black stretch-120">
                    <span className="sr-only">Classe </span>
                    {c.l}
                  </strong>
                </span>
                <span className="flex-1" />
                <span
                  className={cx(
                    "text-[13px] font-bold whitespace-nowrap",
                    c.status ? "text-danger-fg" : "text-text/35",
                  )}
                >
                  {c.status ?? "—"}
                </span>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}
