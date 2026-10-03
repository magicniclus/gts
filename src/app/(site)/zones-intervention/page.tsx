import type { Metadata } from "next";
import { CityLinkGrid } from "@/components/site/CityLinkGrid";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { COMMUNE_COUNT, SECTEURS, SECTEUR_IDS, communesOfSecteur } from "@/lib/data/lookup";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Zones d’intervention — Marseille et 50 km | GTS Diagnostic",
  description: `Diagnostics immobiliers dans ${COMMUNE_COUNT} communes : Marseille, Aubagne, Aix-en-Provence, La Ciotat, Martigues, Vitrolles et l’ouest du Var. Déplacement inclus jusqu’à 30 km.`,
  path: "/zones-intervention",
});

export default async function ZonesPage() {
  const site = await getSiteSettings();
  return (
    <>
      <PageHero
        title="Zones d’intervention :"
        highlight={`${COMMUNE_COUNT} communes`}
        intro="Basé à Marseille, GTS Diagnostic intervient dans les Bouches-du-Rhône et l’ouest du Var à moins de 50 km. Déplacement inclus jusqu’à 30 km."
      />
      <div className="container-site pt-[clamp(40px,5vw,72px)] pb-[clamp(64px,8vw,112px)]">
        {SECTEUR_IDS.map((s) => (
          <section key={s} className="py-7" aria-labelledby={`secteur-${s}`}>
            <h2
              id={`secteur-${s}`}
              className="m-0 font-heading text-2xl font-extrabold text-accent-900 stretch-108"
            >
              {SECTEURS[s]}
            </h2>
            <div className="mt-4">
              <CityLinkGrid communes={communesOfSecteur(s)} />
            </div>
          </section>
        ))}
      </div>
      <CtaBand phone={site.phone} />
    </>
  );
}
