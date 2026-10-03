import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    n: "1",
    icon: "clipboard-text",
    t: "Devis en 2 minutes",
    p: "Six questions : les diagnostics obligatoires sont déterminés pour vous.",
  },
  {
    n: "2",
    icon: "calendar-check",
    t: "Rendez-vous sous 48 h",
    p: "Guillaume vous rappelle et fixe la visite, samedi matin compris.",
  },
  {
    n: "3",
    icon: "house-line",
    t: "Visite sur place",
    p: "De 1 h à 3 h selon la surface et les diagnostics.",
  },
  {
    n: "4",
    icon: "file-arrow-down",
    t: "Rapport sous 24 h",
    p: "Dossier complet par e-mail, prêt pour le notaire ou l’agence.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-site section-y">
      <SectionHeading
        kicker="Comment ça se passe"
        title="Du devis au rapport en"
        highlight="4 étapes"
        after="."
        className="max-w-[20ch]"
      />
      <ol className="m-0 mt-12 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-8 p-0">
        {STEPS.map((s) => (
          <li key={s.n}>
            <div className="flex items-center gap-3.5">
              <span className="grid size-[52px] flex-none place-items-center rounded-full bg-accent-900 text-xl font-extrabold text-white stretch-120">
                {s.n}
              </span>
              <span
                aria-hidden
                className="h-0.5 flex-1 bg-linear-to-r from-accent-300 to-transparent"
              />
            </div>
            <Icon name={s.icon} size={30} className="mt-[22px] block text-accent" />
            <h3 className="mt-3 mb-0 text-xl font-extrabold stretch-108">{s.t}</h3>
            <p className="mt-2 mb-0 text-[15px] leading-relaxed text-text/75">{s.p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
