import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Kicker } from "@/components/ui/Kicker";
import { OptionTile, type OptionTileLayout } from "@/components/ui/OptionTile";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag, type TagTone } from "@/components/ui/Tag";

const noViolations = async (container: HTMLElement) =>
  expect(await axe(container)).toHaveNoViolations();

describe("Button", () => {
  it.each(["primary", "secondary", "ghost", "outlineOnDark"] as const)(
    "variante %s accessible",
    async (variant) => {
      const { container } = render(
        <Button variant={variant} icon="arrow-right">
          Devis gratuit
        </Button>,
      );
      expect(screen.getByRole("button", { name: "Devis gratuit" })).toHaveAttribute(
        "type",
        "button",
      );
      await noViolations(container);
    },
  );

  it("rend un lien interne, téléphone ou externe", async () => {
    const { container } = render(
      <>
        <Button href="/devis">Devis</Button>
        <Button href="tel:+33612345678" icon="phone" iconPosition="start">
          Appeler
        </Button>
      </>,
    );
    expect(screen.getByRole("link", { name: "Devis" })).toHaveAttribute("href", "/devis");
    expect(screen.getByRole("link", { name: "Appeler" })).toHaveAttribute(
      "href",
      "tel:+33612345678",
    );
    await noViolations(container);
  });

  it("désactivé ne déclenche pas le clic", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick} size="xl" block>
        Envoyer
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Tag, Kicker, SectionHeading", () => {
  it.each(["accent", "navy", "success", "warning", "neutral", "danger", "soft"] as TagTone[])(
    "Tag %s",
    async (tone) => {
      const { container } = render(<Tag tone={tone}>Obligatoire</Tag>);
      await noViolations(container);
    },
  );

  it("titre avec mise en valeur", async () => {
    const { container } = render(
      <>
        <Kicker tone="onDark">Zone</Kicker>
        <SectionHeading
          as="h1"
          kicker="Nos diagnostics"
          title="Tous les diagnostics,"
          highlight="un seul expert"
          after="."
        />
        <SectionHeading title="Bloc" size="block" tone="onDark" />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Tous les diagnostics, un seul expert.",
    );
    await noViolations(container);
  });
});

describe("OptionTile", () => {
  it.each(["card", "hero", "tile", "year", "row", "pill", "box", "square"] as OptionTileLayout[])(
    "variante %s : état pressé et accessible",
    async (layout) => {
      const onClick = vi.fn();
      const { container } = render(
        <OptionTile
          layout={layout}
          icon="key"
          label="Je vends"
          hint="Maison"
          selected
          onClick={onClick}
        />,
      );
      const b = screen.getByRole("button", { name: /Je vends/ });
      expect(b).toHaveAttribute("aria-pressed", "true");
      await userEvent.click(b);
      expect(onClick).toHaveBeenCalledOnce();
      await noViolations(container);
    },
  );

  it("non sélectionnée", () => {
    render(<OptionTile label="Oui" selected={false} />);
    expect(screen.getByRole("button", { name: "Oui" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("Champs", () => {
  it("libellés, aide et erreur", async () => {
    const { container } = render(
      <form>
        <Field id="nom" label="Nom">
          <Input id="nom" />
        </Field>
        <Field id="tel" label="Téléphone" error="Numéro invalide.">
          <Input id="tel" aria-invalid aria-describedby="tel-error" />
        </Field>
        <Field id="c" label="Commune" hint="84 communes" optional="(facultatif)">
          <Select id="c" aria-describedby="c-hint">
            <option value="">Choisir…</option>
          </Select>
        </Field>
        <Field id="m" label="Message">
          <Textarea id="m" />
        </Field>
        <Checkbox label="J’accepte" />
      </form>,
    );
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Numéro invalide.");
    expect(screen.getByText("84 communes")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "J’accepte" })).toBeInTheDocument();
    await noViolations(container);
  });
});

describe("Accordion, Breadcrumbs, RichText, ImageFrame, Icon", () => {
  it("Accordion en <details>", async () => {
    const { container } = render(
      <Accordion question="Combien ?" size="lg">
        <p>15 %</p>
      </Accordion>,
    );
    expect(container.querySelector("details summary")).toHaveTextContent("Combien ?");
    await noViolations(container);
  });

  it("Breadcrumbs : page courante et JSON-LD", async () => {
    const { container } = render(
      <Breadcrumbs
        tone="onLight"
        currentPath="/diagnostic-dpe/aubagne"
        items={[
          { name: "Accueil", href: "/" },
          { name: "Diagnostic DPE", href: "/diagnostic-dpe-marseille" },
          { name: "Aubagne" },
        ]}
      />,
    );
    expect(screen.getByText("Aubagne")).toHaveAttribute("aria-current", "page");
    const ld = JSON.parse(container.querySelector("script")?.textContent ?? "{}");
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[2].item).toMatch(/\/diagnostic-dpe\/aubagne$/);
    await noViolations(container);
  });

  it("RichText : intertitres et paragraphes", async () => {
    const { container } = render(<RichText variant="legal" source={"## Titre\nTexte\n\nSuite"} />);
    expect(screen.getByRole("heading", { level: 2, name: "Titre" })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
    await noViolations(container);
  });

  it("ImageFrame : image ou repli", async () => {
    const { container } = render(
      <>
        <ImageFrame src="/logo-navy.png" alt="Logo" ratio="16/9" tone="surface" />
        <ImageFrame src={null} alt="" ratio="4/5" fallbackLabel="Photo à venir" />
      </>,
    );
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Photo à venir")).toBeInTheDocument();
    await noViolations(container);
  });

  it("Icon décorative ou étiquetée, repli si inconnue", () => {
    const { container } = render(
      <>
        <Icon name="phone" />
        <Icon name="inexistante" label="Aide" />
      </>,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs[0]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Aide" })).toBeInTheDocument();
  });
});
