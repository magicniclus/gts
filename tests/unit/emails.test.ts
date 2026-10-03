import { describe, expect, it } from "vitest";
import {
  clientEmail,
  escapeHtml,
  ownerEmail,
  totalLabel,
  type LeadForEmail,
} from "../../functions/src/email";

const lead: LeadForEmail = {
  ref: "L-1042",
  contact: {
    nom: "Sophie Marchetti",
    tel: "06 21 44 87 10",
    email: "s.m@exemple.fr",
    profil: "particulier",
  },
  bien: {
    projet: "vente",
    type: "maison",
    commune: "aubagne",
    communeNom: "Aubagne",
    surface: "100-150",
    annee: "1949-1997",
  },
  rdv: { delai: "semaine", creneau: "matin" },
  message: "Compromis <fin octobre>",
  diagnostics: [
    { name: "DPE", level: "Obligatoire", price: 180 },
    { name: "ERP", level: "Obligatoire", price: 0 },
    { name: "Audit", level: "À vérifier", price: null },
  ],
  estimate: { sub: 1100, remise: 175, deplacement: 0, total: 925, surDevis: false },
};

describe("e-mails de notification", () => {
  it("objet de la notification à Guillaume", () => {
    const m = ownerEmail(lead, "https://exemple.fr/", "L-1042");
    expect(m.subject).toBe("Nouvelle demande L-1042 · Aubagne · 925 €");
    expect(m.text).toContain("https://exemple.fr/espace-proprietaire/demandes?id=L-1042");
    expect(m.text).toContain("Rendez-vous : Cette semaine · Matin");
    expect(m.text).toContain("ERP (offert)");
    expect(m.text).toContain("Audit (sur devis)");
    expect(m.html).toContain("Compromis &lt;fin octobre&gt;");
    expect(m.html).not.toContain("<fin octobre>");
  });

  it("accusé de réception au client", () => {
    const m = clientEmail(lead, "06 12 34 56 78");
    expect(m.subject).toBe("Votre demande de diagnostics L-1042 · GTS Diagnostic");
    expect(m.text).toMatch(/^Merci Sophie,/);
    expect(m.text).toContain("925 € TTC");
  });

  it("total sur devis et repli sur le slug de la commune", () => {
    expect(totalLabel({ sub: 0, remise: 0, deplacement: 0, total: 0, surDevis: true })).toBe(
      "Sur devis",
    );
    const m = ownerEmail(
      {
        ...lead,
        bien: { ...lead.bien, communeNom: undefined },
        contact: { ...lead.contact, email: null },
      },
      "http://x",
      "id",
    );
    expect(m.subject).toContain("· aubagne ·");
    expect(m.text).toContain("E-mail : —");
  });

  it("échappe le HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });
});
