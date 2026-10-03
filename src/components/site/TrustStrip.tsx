import { Icon } from "@/components/ui/Icon";

const ITEMS = [
  { icon: "seal-check", t: "Certifié COFRAC", p: "Toutes mentions, à jour" },
  { icon: "shield-check", t: "Assuré RC Pro", p: "Rapports opposables" },
  { icon: "file-text", t: "Rapport sous 24 h", p: "Par e-mail, prêt pour le notaire" },
  { icon: "car-profile", t: "Déplacement inclus", p: "Jusqu’à 30 km de Marseille" },
];

/** Bande des 4 garanties. */
export function TrustStrip() {
  return (
    <section className="border-b border-divider">
      <ul className="m-0 container-site grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-x-8 gap-y-[18px] py-[26px]">
        {ITEMS.map((t) => (
          <li key={t.t} className="flex items-center gap-3.5">
            <span className="grid size-[46px] flex-none place-items-center rounded-tile bg-accent-100 text-accent">
              <Icon name={t.icon} size={24} />
            </span>
            <span className="grid gap-0.5">
              <strong className="text-[15px] font-bold">{t.t}</strong>
              <span className="text-[13px] text-text/68">{t.p}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
