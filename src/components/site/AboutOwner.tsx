import { Icon } from "@/components/ui/Icon";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CERTS = [
  "DPE avec mention",
  "Amiante avec mention",
  "Plomb (CREP)",
  "Électricité",
  "Gaz",
  "Termites",
  "Audit énergétique",
  "Carrez / Boutin",
];

/** « Qui suis-je » : portrait 4:5 et certifications. */
export function AboutOwner({
  portraitUrl,
  portraitAlt,
}: {
  portraitUrl: string | null;
  portraitAlt: string;
}) {
  return (
    <section id="guillaume" className="bg-accent-900 text-white">
      <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-x-[clamp(32px,6vw,96px)] gap-y-12 section-y">
        <ImageFrame
          src={portraitUrl}
          alt={portraitAlt}
          ratio="4/5"
          fallbackIcon="user"
          fallbackLabel="Photo : Guillaume Tilliet"
          sizes="(max-width: 860px) 100vw, 460px"
          className="max-w-[460px] rounded-hero"
        />
        <div>
          <SectionHeading
            kicker="Votre diagnostiqueur"
            title="Guillaume Tilliet,"
            highlight="certifié sur tous les diagnostics"
            after="."
            tone="onDark"
          />
          <blockquote className="m-0 mt-6 max-w-[46ch] text-[19px] leading-[1.55] text-white/88 italic">
            « Je fais moi-même chaque visite, je rédige chaque rapport et je réponds au téléphone.
            Pas de plateforme, pas de sous-traitance. »
          </blockquote>
          <ul className="m-0 mt-7 flex list-none flex-wrap gap-2 p-0">
            {CERTS.map((c) => (
              <li
                key={c}
                className="inline-flex items-center gap-1.5 rounded-pill border border-white/16 bg-white/9 px-3 py-2 text-sm font-semibold"
              >
                <Icon name="seal-check" size={16} className="text-accent-400" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-[22px] mb-0 text-sm leading-relaxed text-white/70">
            Certifications délivrées par un organisme accrédité COFRAC, vérifiables sur l’annuaire
            officiel des diagnostiqueurs du ministère.
          </p>
        </div>
      </div>
    </section>
  );
}
