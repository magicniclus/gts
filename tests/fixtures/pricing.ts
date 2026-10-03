import type { Pricing } from "@/lib/domain/types";

/** Barème par défaut figé (docs/handoff/data/settings-defaults.json). */
export const DEFAULT_PRICING: Pricing = {
  grid: {
    dpe: [100, 115, 135, 155, 185],
    dpet: [180, 220, 260, 320, 400],
    amiante: [85, 95, 115, 135, 165],
    raat: [220, 250, 290, 340, 400],
    plomb: [100, 115, 140, 165, 195],
    electricite: [80, 90, 100, 110, 125],
    gaz: [80, 85, 90, 95, 100],
    carrez: [45, 55, 65, 80, 100],
    termites: [70, 80, 95, 110, 130],
    audit: [450, 450, 490, 590, 690],
  },
  rules: { maison: 15, annexe: 10, packPct: 15, packMin: 3, d30: 20, d40: 30 },
};

export const withRules = (rules: Partial<Pricing["rules"]>): Pricing => ({
  ...DEFAULT_PRICING,
  rules: { ...DEFAULT_PRICING.rules, ...rules },
});
