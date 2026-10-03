import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext", () => {
  it.each([
    ["/espace-proprietaire/tarifs", "/espace-proprietaire/tarifs"],
    ["/espace-proprietaire/demandes?id=L-1001", "/espace-proprietaire/demandes?id=L-1001"],
    [null, "/espace-proprietaire/demandes"],
    ["https://pirate.example", "/espace-proprietaire/demandes"],
    ["//pirate.example/espace-proprietaire", "/espace-proprietaire/demandes"],
    ["/espace-proprietaire//pirate.example", "/espace-proprietaire/demandes"],
    ["/espace-proprietaire\\@pirate", "/espace-proprietaire/demandes"],
    ["/espace-proprietairex", "/espace-proprietaire/demandes"],
    ["/devis", "/espace-proprietaire/demandes"],
  ])("%s → %s", (input, out) => expect(safeNext(input)).toBe(out));
});
