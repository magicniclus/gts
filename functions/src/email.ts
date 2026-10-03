/** Contenu des e-mails envoyés à la création d’un lead (fonctions pures, testées). */

export type LeadForEmail = {
  ref: string;
  contact: { nom: string; tel: string; email: string | null; profil: string };
  bien: {
    projet: string;
    loc?: string;
    type: string;
    commune: string;
    communeNom?: string;
    adresse?: string;
    surface: string;
    annee: string;
  };
  rdv: { delai: string; creneau?: string; acces?: string };
  message: string;
  diagnostics: { name: string; level: string; price: number | null }[];
  estimate: { sub: number; remise: number; deplacement: number; total: number; surDevis: boolean };
};

export type Email = { subject: string; html: string; text: string };

const LABELS: Record<string, Record<string, string>> = {
  projet: {
    vente: "Vente",
    location: "Location",
    travaux: "Travaux ou démolition",
    autre: "Autre besoin",
  },
  type: { appartement: "Appartement", maison: "Maison", local: "Local pro", immeuble: "Immeuble" },
  surface: {
    "<30": "< 30 m²",
    "30-60": "30 – 60 m²",
    "60-100": "60 – 100 m²",
    "100-150": "100 – 150 m²",
    "150+": "> 150 m²",
  },
  annee: {
    avant1949: "Avant 1949",
    "1949-1997": "1949 – juin 1997",
    "1997-2012": "Juil. 1997 – 2012",
    apres2012: "Après 2012",
    nsp: "Je ne sais pas",
  },
  delai: {
    "48h": "Au plus vite",
    semaine: "Cette semaine",
    "15j": "Sous 15 jours",
    flexible: "Flexible",
  },
  creneau: { matin: "Matin", apresmidi: "Après-midi", samedi: "Samedi matin" },
  profil: {
    particulier: "Particulier",
    agence: "Agence immobilière",
    notaire: "Notaire",
    pro: "Syndic / pro",
  },
};

const label = (k: string, v: string | undefined) => (v ? (LABELS[k]?.[v] ?? v) : "");

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

const euros = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} €`;

export function totalLabel(e: LeadForEmail["estimate"]): string {
  return e.surDevis && e.total === 0 ? "Sur devis" : euros(e.total);
}

function facts(l: LeadForEmail): [string, string][] {
  return [
    ["Nom", l.contact.nom],
    ["Téléphone", l.contact.tel],
    ["E-mail", l.contact.email ?? "—"],
    ["Profil", label("profil", l.contact.profil)],
    ["Projet", label("projet", l.bien.projet)],
    ["Bien", `${label("type", l.bien.type)} · ${label("surface", l.bien.surface)}`],
    ["Commune", l.bien.communeNom ?? l.bien.commune],
    ["Adresse", l.bien.adresse || "—"],
    ["Construction", label("annee", l.bien.annee)],
    [
      "Rendez-vous",
      [label("delai", l.rdv.delai), label("creneau", l.rdv.creneau)].filter(Boolean).join(" · "),
    ],
  ];
}

/** E-mail à Guillaume : « Nouvelle demande L-1042 · Aubagne · 925 € ». */
export function ownerEmail(l: LeadForEmail, siteUrl: string, leadId: string): Email {
  const commune = l.bien.communeNom ?? l.bien.commune;
  const total = totalLabel(l.estimate);
  const link = `${siteUrl.replace(/\/+$/, "")}/espace-proprietaire/demandes?id=${encodeURIComponent(leadId)}`;
  const diags = l.diagnostics.map(
    (d) =>
      `${d.name} (${d.price === null ? "sur devis" : d.price === 0 ? "offert" : euros(d.price)})`,
  );
  const rows = facts(l)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#4a5370">${escapeHtml(k)}</td><td style="padding:4px 0;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;color:#0d1733;max-width:600px">
<h1 style="font-size:20px;color:#0a1a48">Nouvelle demande ${escapeHtml(l.ref)}</h1>
<table style="border-collapse:collapse;font-size:14px">${rows}</table>
<h2 style="font-size:16px;margin-top:20px">Diagnostics retenus</h2>
<ul style="font-size:14px">${diags.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
<p style="font-size:14px">Sous-total ${euros(l.estimate.sub)} · remise ${euros(l.estimate.remise)} · déplacement ${euros(l.estimate.deplacement)}<br><strong style="font-size:18px">Total estimé : ${escapeHtml(total)}</strong></p>
${l.message ? `<p style="font-size:14px;white-space:pre-line;background:#f2f5fb;padding:12px;border-radius:8px">${escapeHtml(l.message)}</p>` : ""}
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#2156e3;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">Voir la demande</a></p>
</div>`;
  const text = [
    `Nouvelle demande ${l.ref}`,
    ...facts(l).map(([k, v]) => `${k} : ${v}`),
    "",
    "Diagnostics retenus :",
    ...diags.map((d) => `- ${d}`),
    `Total estimé : ${total}`,
    l.message ? `\nMessage :\n${l.message}` : "",
    "",
    `Voir la demande : ${link}`,
  ].join("\n");
  return { subject: `Nouvelle demande ${l.ref} · ${commune} · ${total}`, html, text };
}

/** Accusé de réception au client (s’il a saisi un e-mail). */
export function clientEmail(l: LeadForEmail, phone: string): Email {
  const first = l.contact.nom.trim().split(/\s+/)[0] ?? "";
  const diags = l.diagnostics.map((d) => d.name);
  const total = totalLabel(l.estimate);
  const html = `<div style="font-family:Arial,sans-serif;color:#0d1733;max-width:600px">
<h1 style="font-size:20px;color:#0a1a48">Merci ${escapeHtml(first)}, votre demande est bien reçue.</h1>
<p style="font-size:15px">Référence <strong>${escapeHtml(l.ref)}</strong>. Guillaume Tilliet vous rappelle sous 2 h ouvrées au ${escapeHtml(l.contact.tel)} pour confirmer le prix et fixer le rendez-vous.</p>
<p style="font-size:15px">Diagnostics retenus :</p>
<ul style="font-size:15px">${diags.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
<p style="font-size:15px">Estimation indicative : <strong>${escapeHtml(total)} TTC</strong>. Le prix ferme vous sera confirmé avant l’intervention.</p>
<p style="font-size:15px">Une question ? ${escapeHtml(phone)}</p>
<p style="font-size:13px;color:#4a5370">GTS Diagnostic · Guillaume Tilliet, diagnostiqueur immobilier certifié à Marseille.</p>
</div>`;
  const text = [
    `Merci ${first}, votre demande est bien reçue.`,
    `Référence ${l.ref}. Guillaume Tilliet vous rappelle sous 2 h ouvrées au ${l.contact.tel} pour confirmer le prix et fixer le rendez-vous.`,
    "",
    "Diagnostics retenus :",
    ...diags.map((d) => `- ${d}`),
    "",
    `Estimation indicative : ${total} TTC. Le prix ferme vous sera confirmé avant l’intervention.`,
    `Une question ? ${phone}`,
  ].join("\n");
  return { subject: `Votre demande de diagnostics ${l.ref} · GTS Diagnostic`, html, text };
}
