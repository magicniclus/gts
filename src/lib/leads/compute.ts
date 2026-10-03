import { findCommune } from "@/lib/data/lookup";
import { diagList } from "@/lib/domain/obligations";
import { buildRows, estimate } from "@/lib/domain/pricing";
import type { Answers, Estimate, Pricing, Row } from "@/lib/domain/types";
import type { DevisAnswers } from "@/lib/schemas/lead";

/** Réponses du formulaire → entrées du domaine. */
export function toDomainAnswers(a: Partial<DevisAnswers>): Answers {
  return {
    projet: a.projet,
    loc: a.loc,
    nature: a.nature,
    type: a.type,
    surface: a.surface,
    copro: a.copro,
    annee: a.annee,
    gaz: a.gaz,
    elec: a.elec,
    annexes: a.annexes ?? [],
    egout: a.egout,
    classe: a.classe,
    deja: a.deja ?? [],
  };
}

export type LeadComputation = { rows: Row[]; estimate: Estimate };

/**
 * Recalcule obligations et prix (client et serveur partagent ce code ;
 * le serveur ne fait jamais confiance à un montant reçu du navigateur).
 * `checked` absent : cases cochées par défaut.
 */
export function computeLead(
  answers: Partial<DevisAnswers>,
  pricing: Pricing,
  checked?: readonly string[],
): LeadComputation {
  const commune = answers.commune ? findCommune(answers.commune) : undefined;
  const a = toDomainAnswers(answers);
  const rows = buildRows(diagList(a, commune), a, pricing, checked);
  return { rows, estimate: estimate(rows, commune, pricing) };
}
