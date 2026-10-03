import { Timestamp } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PRICING, DEFAULT_SITE } from "@/lib/defaults";
import { dayToTimestamp, timestampToDay, toIso, urlOrNull } from "@/lib/repos/convert";
import { parsePricing } from "@/lib/repos/pricing";
import { parseSiteSettings } from "@/lib/repos/settings";

describe("parseSiteSettings", () => {
  it("document absent → valeurs par défaut", () => {
    expect(parseSiteSettings(undefined)).toEqual(DEFAULT_SITE);
  });
  it("complète les champs manquants et ignore les URL invalides", () => {
    const s = parseSiteSettings({
      phone: "07 00 00 00 00",
      hero: { title: "Nouveau titre" },
      photos: {
        portraitUrl: "https://storage.example/p.jpg",
        logoLightUrl: "data:image/png;base64,xx",
      },
      updatedAt: Timestamp.fromDate(new Date("2026-10-01T10:00:00Z")),
    });
    expect(s.phone).toBe("07 00 00 00 00");
    expect(s.email).toBe(DEFAULT_SITE.email);
    expect(s.hero).toEqual({ ...DEFAULT_SITE.hero, title: "Nouveau titre" });
    expect(s.photos.portraitUrl).toBe("https://storage.example/p.jpg");
    expect(s.photos.logoLightUrl).toBeNull();
    expect(s.updatedAt).toBe("2026-10-01T10:00:00.000Z");
  });
});

describe("parsePricing", () => {
  it("document absent → barème par défaut", () => {
    expect(parsePricing(undefined)).toBe(DEFAULT_PRICING);
  });
  it("fusionne une grille partielle", () => {
    const p = parsePricing({ grid: { dpe: [120, 130, 140, 150, 160] }, rules: { packPct: 10 } });
    expect(p.grid.dpe).toEqual([120, 130, 140, 150, 160]);
    expect(p.grid.gaz).toEqual(DEFAULT_PRICING.grid.gaz);
    expect(p.rules).toEqual({ ...DEFAULT_PRICING.rules, packPct: 10 });
  });
  it("document invalide → barème par défaut", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(parsePricing({ grid: { dpe: [-1, 0, 0, 0, 0] } })).toBe(DEFAULT_PRICING);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("conversions", () => {
  it("dates", () => {
    const t = dayToTimestamp("2026-09-18");
    expect(timestampToDay(t)).toBe("2026-09-18");
    expect(toIso(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01T00:00:00.000Z");
    expect(toIso("x")).toBeNull();
    expect(timestampToDay(undefined)).toBe("");
  });
  it("URL", () => {
    expect(urlOrNull("http://127.0.0.1:9199/x")).toBe("http://127.0.0.1:9199/x");
    expect(urlOrNull("")).toBeNull();
    expect(urlOrNull(null)).toBeNull();
  });
});
