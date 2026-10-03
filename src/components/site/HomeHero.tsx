import { Icon } from "@/components/ui/Icon";
import { Kicker } from "@/components/ui/Kicker";
import { HeroDevisCard } from "./HeroDevisCard";

export type HeroContent = { kicker: string; title: string; highlight: string; intro: string };

/** Hero de l’accueil : texte éditable (settings/site.hero), chiffres clés, carte devis étape 1. */
export function HomeHero({
  hero,
  packPct,
  packMin,
}: {
  hero: HeroContent;
  packPct: number;
  packMin: number;
}) {
  const stats = [
    { v: "24 h", k: "pour recevoir\nle rapport" },
    { v: "48 h", k: "pour un\nrendez-vous" },
    { v: `−${packPct} %`, k: `dès ${packMin}\ndiagnostics` },
  ];
  return (
    <section className="bg-accent-900 bg-[radial-gradient(55%_70%_at_88%_0%,color-mix(in_srgb,var(--color-accent)_42%,transparent),transparent_70%)] text-white">
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-12 pt-[clamp(48px,7vw,96px)] pb-[clamp(56px,7vw,104px)]">
        <div>
          <Kicker tone="onDark">{hero.kicker}</Kicker>
          <h1 className="mt-[22px] mb-0 font-heading text-[clamp(38px,5.2vw,68px)] leading-[1.02] font-extrabold tracking-[-0.025em] text-balance stretch-118">
            {hero.title} <span className="text-accent-400">{hero.highlight}</span>
          </h1>
          <p className="mt-6 mb-0 max-w-[52ch] text-[clamp(17px,1.5vw,19px)] leading-relaxed text-white/82">
            {hero.intro}
          </p>
          <dl className="m-0 mt-9 grid grid-cols-[repeat(3,auto)] justify-start gap-x-[clamp(20px,3vw,44px)] gap-y-3">
            {stats.map((s) => (
              <div key={s.v} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-sm leading-[1.35] whitespace-pre-line text-white/72">
                  {s.k}
                </dt>
                <dd className="m-0 text-[clamp(28px,3vw,38px)] leading-none font-extrabold stretch-120">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="m-0 mt-9 flex list-none flex-wrap gap-x-[18px] gap-y-2 p-0 text-sm text-white/80">
            {["Certifications à jour", "Assurance RC Pro", "Déplacement inclus jusqu’à 30 km"].map(
              (t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Icon name="check-circle" size={18} className="text-accent-400" />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>
        <HeroDevisCard />
      </div>
    </section>
  );
}
