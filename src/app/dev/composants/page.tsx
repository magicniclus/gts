import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Kicker } from "@/components/ui/Kicker";
import { OptionTile } from "@/components/ui/OptionTile";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { AboutOwner } from "@/components/site/AboutOwner";
import { ArticleGrid } from "@/components/site/ArticleCard";
import { CityLinkGrid } from "@/components/site/CityLinkGrid";
import { CommuneColumns } from "@/components/site/CommuneColumns";
import { CommuneSearch } from "@/components/site/CommuneSearch";
import { ContentHero } from "@/components/site/ContentHero";
import { CtaBand } from "@/components/site/CtaBand";
import { DiagnosticCard } from "@/components/site/DiagnosticCard";
import { DiagnosticGrid } from "@/components/site/DiagnosticGrid";
import { DpeScale } from "@/components/site/DpeScale";
import { FaqSection } from "@/components/site/FaqSection";
import { HomeHero } from "@/components/site/HomeHero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { NumberedBlocks } from "@/components/site/NumberedBlocks";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { SectorList } from "@/components/site/SectorList";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TrustStrip } from "@/components/site/TrustStrip";
import { UtilityBar } from "@/components/site/UtilityBar";
import { COMMUNES, DIAGNOSTICS, DIAGNOSTIC_IDS, findCommune } from "@/lib/data/lookup";
import { cityPage } from "@/lib/domain/city-content";
import { routes } from "@/lib/domain/routes";

export const metadata: Metadata = {
  title: "Composants | GTS Diagnostic",
  robots: { index: false, follow: false },
};

/** Catalogue des composants. Absent en production (sauf ENABLE_DEV_PAGES=1) et du sitemap. */
function devPagesEnabled() {
  return process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_PAGES === "1";
}

function Specimen({
  title,
  children,
  dark,
}: {
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className="border-t border-divider py-10">
      <h2 className="m-0 container-site mb-5 font-mono text-sm text-text/65">{title}</h2>
      <div className={dark ? "bg-accent-900 py-8" : ""}>{children}</div>
    </section>
  );
}

const PHONE = "06 12 34 56 78";

export default function ComposantsPage() {
  if (!devPagesEnabled()) notFound();
  const aubagne = findCommune("aubagne");
  if (!aubagne) notFound();
  const city = cityPage(aubagne, "dpe", 100);
  return (
    <main>
      <div className="container-site py-10">
        <h1 className="m-0 font-heading text-4xl font-extrabold text-accent-900 stretch-115">
          Composants
        </h1>
        <p className="text-text/70">Toutes les variantes, à comparer avec docs/handoff/design.</p>
      </div>

      <Specimen title="ui/Button">
        <div className="container-site flex flex-wrap gap-3">
          <Button>Primaire md</Button>
          <Button size="xl" icon="arrow-right">
            Primaire xl
          </Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost" icon="arrow-left" iconPosition="start">
            Fantôme
          </Button>
          <Button disabled>Désactivé</Button>
          <Button href={routes.devis()} icon="arrow-right">
            Lien
          </Button>
        </div>
      </Specimen>
      <Specimen title="ui/Button outlineOnDark" dark>
        <div className="container-site flex gap-3">
          <Button variant="outlineOnDark" icon="phone" iconPosition="start">
            {PHONE}
          </Button>
        </div>
      </Specimen>

      <Specimen title="ui/Tag">
        <div className="container-site flex flex-wrap gap-2">
          <Tag tone="navy">Obligatoire</Tag>
          <Tag tone="accent">Nouveau</Tag>
          <Tag tone="soft">Rappelé</Tag>
          <Tag tone="success">Déjà valide</Tag>
          <Tag tone="warning">Devis envoyé</Tag>
          <Tag tone="neutral">Perdu</Tag>
          <Tag tone="danger">Erreur</Tag>
        </div>
      </Specimen>

      <Specimen title="ui/Kicker, ui/SectionHeading">
        <div className="container-site grid gap-8">
          <Kicker>Nos diagnostics</Kicker>
          <SectionHeading
            kicker="Nos diagnostics"
            title="Tous les diagnostics,"
            highlight="un seul expert"
            after="."
          />
          <SectionHeading title="Questions fréquentes à Aubagne" size="block" />
        </div>
      </Specimen>
      <Specimen title="ui/SectionHeading onDark" dark>
        <SectionHeading
          className="container-site"
          kicker="Votre diagnostiqueur"
          title="Guillaume Tilliet,"
          highlight="certifié"
          tone="onDark"
        />
      </Specimen>

      <Specimen title="ui/OptionTile">
        <div className="container-site grid gap-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            <OptionTile
              layout="card"
              icon="key"
              label="Je vends mon bien"
              hint="Maison, appartement, local"
              selected
            />
            <OptionTile
              layout="card"
              icon="house-line"
              label="Je mets en location"
              hint="Bail vide ou meublé"
              selected={false}
            />
          </div>
          <div className="grid max-w-md grid-cols-2 gap-2.5">
            <OptionTile layout="hero" icon="key" label="Je vends" selected />
            <OptionTile layout="hero" icon="hammer" label="Travaux" selected={false} />
          </div>
          <div className="flex flex-wrap gap-2">
            <OptionTile layout="pill" label="30 – 60 m²" selected />
            <OptionTile layout="pill" icon="garage" label="Garage" selected={false} />
            <OptionTile layout="box" label="Oui" selected />
            <OptionTile layout="square" label="3" selected={false} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
            <OptionTile layout="tile" icon="house" label="Maison" selected />
            <OptionTile layout="year" label="Avant 1949" hint="Amiante + plomb" selected={false} />
            <OptionTile layout="row" icon="fire" label="Gaz" selected />
          </div>
        </div>
      </Specimen>

      <Specimen title="ui/Field, Input, Select, Textarea, Checkbox">
        <form className="container-site grid max-w-xl gap-4">
          <Field id="d-nom" label="Nom et prénom">
            <Input id="d-nom" autoComplete="name" />
          </Field>
          <Field id="d-tel" label="Téléphone" error="Numéro de téléphone invalide.">
            <Input
              id="d-tel"
              type="tel"
              aria-invalid
              aria-describedby="d-tel-error"
              defaultValue="06"
            />
          </Field>
          <Field id="d-commune" label="Commune" hint="84 communes desservies">
            <Select id="d-commune" aria-describedby="d-commune-hint" defaultValue="">
              <option value="">Choisir…</option>
              <option value="aubagne">Aubagne (13400)</option>
            </Select>
          </Field>
          <Field id="d-msg" label="Précisions" optional="(facultatif)">
            <Textarea id="d-msg" rows={3} />
          </Field>
          <Checkbox label="J’accepte que GTS Diagnostic utilise ces informations pour établir mon devis." />
        </form>
      </Specimen>

      <Specimen title="ui/Accordion">
        <div className="container-site grid max-w-2xl gap-2.5">
          <Accordion question="Combien coûte un pack de diagnostics ?" size="lg">
            <p className="m-0">Remise de 15 % dès trois diagnostics, ERP offert.</p>
          </Accordion>
        </div>
      </Specimen>

      <Specimen title="ui/Breadcrumbs (fond clair)">
        <div className="container-site">
          <Breadcrumbs
            tone="onLight"
            currentPath="/conseils/x"
            items={[
              { name: "Accueil", href: "/" },
              { name: "Conseils", href: "/conseils" },
              { name: "Article" },
            ]}
          />
        </div>
      </Specimen>

      <Specimen title="ui/RichText">
        <RichText
          className="container-site max-w-[780px]"
          source={"## Un intertitre\nUn paragraphe\nsur deux lignes.\n\nUn second paragraphe."}
        />
      </Specimen>

      <Specimen title="ui/ImageFrame (repli)">
        <div className="container-site grid max-w-2xl grid-cols-2 gap-4">
          <ImageFrame
            src={null}
            alt=""
            ratio="4/5"
            fallbackIcon="user"
            fallbackLabel="Photo : Guillaume Tilliet"
            className="rounded-hero"
          />
          <ImageFrame src={null} alt="" ratio="16/9" tone="surface" className="rounded-card" />
        </div>
      </Specimen>

      <Specimen title="site/UtilityBar + SiteHeader">
        <UtilityBar hours="Lun – sam · 8 h – 19 h" packPct={15} packMin={3} />
        <SiteHeader phone={PHONE} />
      </Specimen>

      <Specimen title="site/HomeHero">
        <HomeHero
          hero={{
            kicker: "Diagnostiqueur indépendant · Marseille",
            title: "Vos diagnostics immobiliers,",
            highlight: "rapport en 24 h.",
            intro:
              "DPE, amiante, plomb, électricité, gaz : Guillaume Tilliet réalise chaque visite lui-même.",
          }}
          packPct={15}
          packMin={3}
        />
      </Specimen>

      <Specimen title="site/TrustStrip">
        <TrustStrip />
      </Specimen>

      <Specimen title="site/DiagnosticCard (vedettes)">
        <div className="container-site grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {(["navy", "blue", "light"] as const).map((theme, i) => {
            const id = (["dpe", "amiante", "plomb"] as const)[i] ?? "dpe";
            const d = DIAGNOSTICS[id];
            return (
              <DiagnosticCard
                key={theme}
                featured
                theme={theme}
                href={routes.diagnostic(id)}
                name={d.long}
                short={d.name}
                icon={d.icon}
                when={d.when}
                valid={d.valid}
                priceLabel={`dès ${d.price} €`}
              />
            );
          })}
        </div>
      </Specimen>

      <Specimen title="site/DiagnosticGrid">
        <div className="container-site">
          <DiagnosticGrid
            cards={DIAGNOSTIC_IDS.map((id) => ({
              id,
              href: routes.diagnostic(id),
              name: DIAGNOSTICS[id].long,
              icon: DIAGNOSTICS[id].icon,
              when: DIAGNOSTICS[id].when,
              priceLabel: DIAGNOSTICS[id].price ? `dès ${DIAGNOSTICS[id].price} €` : "Offert",
            }))}
          />
        </div>
      </Specimen>

      <Specimen title="site/DpeScale">
        <DpeScale />
      </Specimen>
      <Specimen title="site/HowItWorks">
        <HowItWorks />
      </Specimen>
      <Specimen title="site/AboutOwner">
        <AboutOwner portraitUrl={null} portraitAlt="Guillaume Tilliet" />
      </Specimen>

      <Specimen title="site/CommuneSearch + SectorList">
        <div className="container-site">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-end gap-x-16 gap-y-6">
            <SectionHeading
              kicker="Zone d’intervention"
              title="Marseille et"
              highlight="50 km autour"
              after="."
            />
            <CommuneSearch phone={PHONE} />
          </div>
          <SectorList />
        </div>
      </Specimen>

      <Specimen title="site/CityLinkGrid">
        <div className="container-site">
          <CityLinkGrid communes={COMMUNES.slice(16, 22)} />
        </div>
      </Specimen>

      <Specimen title="site/ContentHero + FactsRow">
        <ContentHero
          crumbs={city.crumbs}
          path={city.path}
          icon={city.icon}
          h1a={city.h1a}
          h1b={city.h1b}
          intro={city.intro}
          cta={city.cta}
          devisHref={city.devisHref}
          phone={PHONE}
          facts={city.facts}
        />
      </Specimen>
      <Specimen title="site/NumberedBlocks">
        <NumberedBlocks blocks={city.blocks} />
      </Specimen>
      <Specimen title="site/FaqSection + RelatedLinks">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-x-24 gap-y-8">
          <FaqSection title={city.faqTitle} faq={city.faq} />
          <RelatedLinks title={city.relTitle} links={city.related} neighbors={city.neighbors} />
        </div>
      </Specimen>
      <Specimen title="site/CommuneColumns">
        <CommuneColumns
          dname="DPE"
          communes={COMMUNES.slice(0, 12).map((c) => ({
            name: c.name,
            href: routes.city("dpe", c.slug),
          }))}
        />
      </Specimen>

      <Specimen title="site/ArticleGrid">
        <div className="container-site">
          <ArticleGrid
            articles={[
              {
                slug: "dpe-2026-ce-qui-change",
                title: "DPE 2026 : ce qui change",
                excerpt: "Le coefficient de l’électricité passe de 2,3 à 1,9.",
                category: "DPE",
                dateLabel: "18 septembre 2026",
                coverUrl: null,
                coverAlt: "",
              },
              {
                slug: "termites",
                title: "Termites dans les Bouches-du-Rhône",
                excerpt: "Tout le département est classé zone termites.",
                category: "Réglementation",
                dateLabel: "21 août 2026",
                coverUrl: null,
                coverAlt: "",
              },
            ]}
          />
        </div>
      </Specimen>

      <Specimen title="site/CtaBand">
        <CtaBand phone={PHONE} />
      </Specimen>
      <Specimen title="site/SiteFooter">
        <SiteFooter phone={PHONE} email="contact@exemple.fr" siret="" />
      </Specimen>
    </main>
  );
}
