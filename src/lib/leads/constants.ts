/** Constantes partagées client / serveur, sans dépendance à zod (bundle du formulaire allégé). */
export const CONSENT_TEXT =
  "J’accepte que GTS Diagnostic utilise ces informations pour établir mon devis. Aucune revente, aucune prospection.";

export const LEAD_STATUSES = ["nouveau", "rappele", "devis_envoye", "gagne", "perdu"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
