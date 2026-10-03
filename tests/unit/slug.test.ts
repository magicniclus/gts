import { describe, expect, it } from "vitest";
import { isSlug, slugify } from "@/lib/domain/slug";

describe("slugify", () => {
  it.each([
    ["Berre-l’Étang", "berre-l-etang"],
    ["La Cadière-d’Azur", "la-cadiere-d-azur"],
    ["Marseille 1er", "marseille-1er"],
    ["Éguilles", "eguilles"],
    ["Châteauneuf-les-Martigues", "chateauneuf-les-martigues"],
    ["  DPE 2026 : ce qui change !  ", "dpe-2026-ce-qui-change"],
    ["L'apostrophe droite", "l-apostrophe-droite"],
    ["Œuvre — tiret cadratin", "oeuvre-tiret-cadratin"],
    ["Le cœur ancien", "le-coeur-ancien"],
    ["", ""],
    ["---", ""],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("isSlug", () => {
  it("accepte un slug valide", () => {
    expect(isSlug("berre-l-etang")).toBe(true);
    expect(isSlug("a1")).toBe(true);
  });
  it.each(["", "-a", "a-", "a--b", "A", "é", "a b"])("refuse « %s »", (v) => {
    expect(isSlug(v)).toBe(false);
  });
});
