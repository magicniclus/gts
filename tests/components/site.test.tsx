import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { AboutOwner } from "@/components/site/AboutOwner";
import { ArticleGrid } from "@/components/site/ArticleCard";
import { CityLinkGrid } from "@/components/site/CityLinkGrid";
import { CommuneColumns } from "@/components/site/CommuneColumns";
import { CommuneSearch, searchCommunes } from "@/components/site/CommuneSearch";
import { ContentHero } from "@/components/site/ContentHero";
import { CtaBand } from "@/components/site/CtaBand";
import { DiagnosticCard } from "@/components/site/DiagnosticCard";
import { DiagnosticGrid } from "@/components/site/DiagnosticGrid";
import { DpeScale } from "@/components/site/DpeScale";
import { FaqSection } from "@/components/site/FaqSection";
import { HomeHero } from "@/components/site/HomeHero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { NumberedBlocks } from "@/components/site/NumberedBlocks";
import { telHref } from "@/components/site/PhoneLink";
import { RelatedLinks } from "@/components/site/RelatedLinks";
import { SectorList } from "@/components/site/SectorList";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TrustStrip } from "@/components/site/TrustStrip";
import { UtilityBar } from "@/components/site/UtilityBar";
import { COMMUNES, findCommune } from "@/lib/data/lookup";
import { DRAFT_KEY } from "@/lib/devis-draft";
import { cityPage } from "@/lib/domain/city-content";

const PHONE = "06 12 34 56 78";
const noViolations = async (container: HTMLElement) =>
  expect(await axe(container)).toHaveNoViolations();
const aubagne = findCommune("aubagne")!;
const city = cityPage(aubagne, "dpe", 100);

describe("structure du site", () => {
  it("UtilityBar affiche horaires et promo", async () => {
    const { container } = render(
      <UtilityBar hours="Lun – sam · 8 h – 19 h" packPct={15} packMin={3} />,
    );
    expect(container).toHaveTextContent("Lun – sam · 8 h – 19 h");
    expect(container).toHaveTextContent("−15 % dès 3 diagnostics · ERP offert");
    await noViolations(container);
  });

  it("SiteHeader : pas de menu, téléphone et devis", async () => {
    const { container } = render(<SiteHeader phone={PHONE} />);
    expect(screen.getByRole("link", { name: /Appel direct/ })).toHaveAttribute(
      "href",
      "tel:+33612345678",
    );
    expect(screen.getByRole("link", { name: /Devis gratuit/ })).toHaveAttribute("href", "/devis");
    expect(screen.queryByRole("navigation")).toBeNull();
    await noViolations(container);
  });

  it("SiteFooter : colonnes SEO et liens légaux", async () => {
    const { container } = render(<SiteFooter phone={PHONE} email="a@b.fr" siret="" />);
    expect(screen.getByRole("link", { name: "DPE Aubagne" })).toHaveAttribute(
      "href",
      "/diagnostic-dpe/aubagne",
    );
    expect(screen.getByRole("link", { name: "CGV" })).toHaveAttribute("href", "/cgv");
    expect(screen.getByRole("link", { name: "Espace propriétaire" })).toHaveAttribute(
      "href",
      "/espace-proprietaire",
    );
    expect(container).toHaveTextContent("SIRET à compléter");
    await noViolations(container);
  });

  it("CtaBand", async () => {
    const { container } = render(<CtaBand phone={PHONE} />);
    expect(screen.getByRole("link", { name: /Commencer mon devis/ })).toHaveAttribute(
      "href",
      "/devis",
    );
    await noViolations(container);
  });

  it("telHref", () => {
    expect(telHref("04 91 22 18 40")).toBe("tel:+33491221840");
    expect(telHref("+33 6 12")).toBe("tel:+33612");
  });
});

describe("accueil", () => {
  beforeEach(() => {
    push.mockReset();
    sessionStorage.clear();
  });

  it("HomeHero : texte éditable et carte devis accessible", async () => {
    const { container } = render(
      <HomeHero
        hero={{
          kicker: "K",
          title: "Vos diagnostics,",
          highlight: "rapport en 24 h.",
          intro: "Intro",
        }}
        packPct={15}
        packMin={3}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Vos diagnostics, rapport en 24 h.",
    );
    await noViolations(container);
  });

  it("la carte du hero transmet ses réponses à /devis", async () => {
    render(
      <HomeHero
        hero={{ kicker: "K", title: "T", highlight: "H", intro: "I" }}
        packPct={15}
        packMin={3}
      />,
    );
    const go = screen.getByRole("button", { name: /Voir mes diagnostics/ });
    expect(go).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Je vends" }));
    await userEvent.click(screen.getByRole("button", { name: "Appartement" }));
    await userEvent.selectOptions(screen.getByLabelText("Commune du bien"), "marseille-8e");
    expect(go).toBeEnabled();
    await userEvent.click(go);
    expect(JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")).toEqual({
      projet: "vente",
      type: "appartement",
      commune: "marseille-8e",
    });
    expect(push).toHaveBeenCalledWith("/devis");
  });

  it("TrustStrip, DpeScale, HowItWorks, AboutOwner", async () => {
    const { container } = render(
      <main>
        <TrustStrip />
        <DpeScale />
        <HowItWorks />
        <AboutOwner portraitUrl={null} portraitAlt="Guillaume Tilliet" />
      </main>,
    );
    expect(container).toHaveTextContent("Interdit depuis 2025");
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(10);
    await noViolations(container);
  });

  it("DiagnosticCard (toutes les variantes) et DiagnosticGrid", async () => {
    const base = {
      href: "/diagnostic-dpe-marseille",
      name: "Diagnostic de performance énergétique",
      icon: "lightning",
      when: "Vente",
      priceLabel: "dès 100 €",
    };
    const { container } = render(
      <>
        {(["navy", "blue", "light"] as const).map((theme) => (
          <DiagnosticCard key={theme} {...base} featured theme={theme} short="DPE" valid="10 ans" />
        ))}
        <DiagnosticGrid cards={[{ id: "dpe", ...base }]} />
      </>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(4);
    await noViolations(container);
  });
});

describe("zones", () => {
  it("SectorList : 7 secteurs, 8 communes max puis lien", async () => {
    const { container } = render(<SectorList />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(7);
    expect(screen.getByRole("link", { name: "+ 13 communes" })).toHaveAttribute(
      "href",
      "/zones-intervention",
    );
    await noViolations(container);
  });

  it("CityLinkGrid", async () => {
    const { container } = render(<CityLinkGrid communes={COMMUNES.slice(0, 3)} />);
    expect(screen.getByRole("link", { name: "Amiante à Marseille 2e" })).toHaveAttribute(
      "href",
      "/diagnostic-amiante/marseille-2e",
    );
    await noViolations(container);
  });

  it("CommuneSearch par nom ou code postal", async () => {
    const { container } = render(<CommuneSearch phone={PHONE} />);
    const input = screen.getByRole("searchbox", { name: "Rechercher une commune" });
    await userEvent.type(input, "aubag");
    expect(screen.getByRole("link", { name: "DPE à Aubagne" })).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "zzzz");
    expect(container).toHaveTextContent("Commune hors liste ? Appelez le 06 12 34 56 78");
    await noViolations(container);
  });

  it("searchCommunes", () => {
    expect(searchCommunes("a")).toBeNull();
    expect(searchCommunes("13600")?.map((c) => c.slug)).toEqual(["la-ciotat", "ceyreste"]);
    expect(searchCommunes("berre l’étang")?.[0]?.slug).toBe("berre-l-etang");
    expect(searchCommunes("marseille")).toHaveLength(9);
  });
});

describe("pages diagnostic et ville", () => {
  it("ContentHero + FactsRow", async () => {
    const { container } = render(
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
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Diagnostic DPE à Aubagne (13400)",
    );
    expect(screen.getByRole("link", { name: /Devis DPE à Aubagne/ })).toHaveAttribute(
      "href",
      "/devis?commune=aubagne",
    );
    expect(screen.getByText("Dès 100 € TTC")).toBeInTheDocument();
    await noViolations(container);
  });

  it("NumberedBlocks, FaqSection, RelatedLinks, CommuneColumns", async () => {
    const { container } = render(
      <main>
        <NumberedBlocks blocks={city.blocks} />
        <FaqSection title={city.faqTitle} faq={city.faq} />
        <RelatedLinks title={city.relTitle} links={city.related} neighbors={city.neighbors} />
        <CommuneColumns
          dname="DPE"
          communes={[{ name: "Aubagne", href: "/diagnostic-dpe/aubagne" }]}
        />
      </main>,
    );
    const ld = [...container.querySelectorAll("script")].map((s) =>
      JSON.parse(s.textContent ?? "{}"),
    );
    expect(ld.find((x) => x["@type"] === "FAQPage")?.mainEntity).toHaveLength(3);
    expect(screen.getByRole("link", { name: "DPE Aubagne" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Communes voisines" })).toBeInTheDocument();
    await noViolations(container);
  });
});

describe("articles", () => {
  it("ArticleGrid : couverture ou icône de catégorie", async () => {
    const { container } = render(
      <ArticleGrid
        articles={[
          {
            slug: "a",
            title: "A",
            excerpt: "e",
            category: "DPE",
            dateLabel: "18 septembre 2026",
            coverUrl: null,
            coverAlt: "",
          },
          {
            slug: "b",
            title: "B",
            excerpt: "e",
            category: "Inconnue",
            dateLabel: "1 août 2026",
            coverUrl: "/logo-navy.png",
            coverAlt: "Couverture B",
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /^DPE · 18 septembre 2026/ })).toHaveAttribute(
      "href",
      "/conseils/a",
    );
    expect(screen.getByAltText("Couverture B")).toBeInTheDocument();
    await noViolations(container);
  });
});
