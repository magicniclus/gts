import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AboutOwner } from "@/components/site/AboutOwner";
import { CommuneSearch } from "@/components/site/CommuneSearch";
import { CtaBand } from "@/components/site/CtaBand";
import { DiagnosticGrid } from "@/components/site/DiagnosticGrid";
import { DpeScale } from "@/components/site/DpeScale";
import { FaqList } from "@/components/site/FaqSection";
import { HomeHero } from "@/components/site/HomeHero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { telHref } from "@/components/site/PhoneLink";
import { SectorList } from "@/components/site/SectorList";
import { TrustStrip } from "@/components/site/TrustStrip";
import { COMMUNE_COUNT, DIAGNOSTICS, DIAGNOSTIC_IDS } from "@/lib/data/lookup";
import { fillPlaceholders } from "@/lib/domain/markdown-lite";
import { diagnosticFromPrice } from "@/lib/domain/pricing";
import { routes } from "@/lib/domain/routes";
import { getPricing } from "@/lib/repos/pricing";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "GTS Diagnostic, diagnostiqueur immobilier à Marseille",
  description:
    "DPE, amiante, plomb, électricité, gaz à Marseille et 50 km autour. Guillaume Tilliet, diagnostiqueur certifié. Rapport sous 24 h, devis gratuit en 2 min.",
  path: "/",
});

const HOME_FAQ = [
  {
    q: "Quels diagnostics pour vendre un appartement à Marseille ?",
    a: "Au minimum DPE, mesurage Carrez et ERP, puis selon l’âge du bien : amiante (permis avant juillet 1997), plomb (avant 1949), électricité et gaz (installations de plus de 15 ans). Le formulaire de devis fait le tri pour vous.",
  },
  {
    q: "Combien coûte un pack de diagnostics ?",
    a: "Pour un appartement de 60 m² construit avant 1997, comptez généralement entre 250 et 400 € TTC. Remise de 15 % dès trois diagnostics, ERP offert.",
  },
  {
    q: "Sous quel délai pouvez-vous intervenir ?",
    a: "Sous 48 h à Marseille et dans les communes à moins de 35 km, sous 72 h au-delà. Le rapport est livré sous 24 h après la visite.",
  },
  {
    q: "Pourquoi choisir un diagnostiqueur indépendant ?",
    a: "Un seul interlocuteur du devis au rapport, aucune commission d’apporteur d’affaires, et un expert qui connaît le bâti local, du trois-fenêtres marseillais aux villas de la Côte Bleue.",
  },
];

export default async function HomePage() {
  const [site, pricing] = await Promise.all([getSiteSettings(), getPricing()]);
  const { packPct, packMin } = pricing.rules;
  const faq = HOME_FAQ.map((x) => ({ ...x, a: x.a.replace("15 %", `${packPct} %`) }));
  const cards = DIAGNOSTIC_IDS.map((id) => {
    const d = DIAGNOSTICS[id];
    const price = diagnosticFromPrice(id, pricing);
    return {
      id,
      href: routes.diagnostic(id),
      name: d.long,
      icon: d.icon,
      when: d.when,
      priceLabel: price ? `dès ${price} €` : "Offert",
    };
  });
  return (
    <>
      <HomeHero
        hero={{
          ...site.hero,
          intro: fillPlaceholders(site.hero.intro, { communes: COMMUNE_COUNT }),
        }}
        packPct={packPct}
        packMin={packMin}
      />
      <TrustStrip />

      <section id="diagnostics" className="container-site section-y">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            className="max-w-[680px]"
            kicker="Nos diagnostics"
            title="Tous les diagnostics,"
            highlight="un seul expert"
            after="."
          />
          <Link
            href={routes.devis()}
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold whitespace-nowrap"
          >
            Quels diagnostics pour mon bien ?
            <Icon name="arrow-right" />
          </Link>
        </div>
        <DiagnosticGrid cards={cards} />
      </section>

      <DpeScale />
      <HowItWorks />
      <AboutOwner portraitUrl={site.photos.portraitUrl} portraitAlt={site.photos.portraitAlt} />

      <section id="zones" className="container-site section-y">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-end gap-x-16 gap-y-6">
          <SectionHeading
            kicker="Zone d’intervention"
            title="Marseille et"
            highlight="50 km autour"
            after="."
          />
          <CommuneSearch phone={site.phone} />
        </div>
        <SectorList />
      </section>

      <section className="bg-surface">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-x-[clamp(32px,6vw,96px)] gap-y-8 section-y">
          <div>
            <SectionHeading
              kicker="Questions fréquentes"
              title="Vos questions,"
              highlight="nos réponses"
              after="."
            />
            <p className="mt-[18px] mb-0 text-base leading-relaxed text-text/75">
              Une autre question ? Guillaume répond directement au{" "}
              <a href={telHref(site.phone)} className="font-bold whitespace-nowrap">
                {site.phone}
              </a>
              .
            </p>
          </div>
          <FaqList faq={faq} surface="white" size="lg" />
        </div>
      </section>

      <CtaBand phone={site.phone} />
    </>
  );
}
