import { describe, expect, it } from "vitest";
import { fillPlaceholders, parseMarkdownLite, plainText } from "@/lib/domain/markdown-lite";

describe("parseMarkdownLite", () => {
  it("intertitres et paragraphes", () => {
    expect(
      parseMarkdownLite("## Titre\nTexte un\nligne deux\n\nAutre paragraphe\n\n\n## Seul"),
    ).toEqual([
      { type: "h", text: "Titre" },
      { type: "p", text: "Texte un\nligne deux" },
      { type: "p", text: "Autre paragraphe" },
      { type: "h", text: "Seul" },
    ]);
  });

  it("ignore les blocs vides et les espaces", () => {
    expect(parseMarkdownLite("  \n\n  a  \n \n")).toEqual([{ type: "p", text: "a" }]);
    expect(parseMarkdownLite("")).toEqual([]);
  });

  it("« ## » sans espace n’est pas un intertitre", () => {
    expect(parseMarkdownLite("##pas un titre")).toEqual([{ type: "p", text: "##pas un titre" }]);
  });
});

describe("fillPlaceholders", () => {
  it("remplace {telephone}, {email} et {communes}", () => {
    expect(
      fillPlaceholders("Appelez le {telephone} ou écrivez à {email}, {communes} communes.", {
        telephone: "06 12 34 56 78",
        email: "a@b.fr",
        communes: 69,
      }),
    ).toBe("Appelez le 06 12 34 56 78 ou écrivez à a@b.fr, 69 communes.");
  });

  it("valeur vide → [à compléter], clé inconnue conservée", () => {
    expect(fillPlaceholders("SIRET : {siret} · {inconnu}", { siret: "  " })).toBe(
      "SIRET : [à compléter] · {inconnu}",
    );
  });
});

describe("plainText", () => {
  it("aplatit le texte", () => {
    expect(plainText("## Titre\nUn\n\nDeux  trois")).toBe("Titre Un Deux trois");
  });
});
