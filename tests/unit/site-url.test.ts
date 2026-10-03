import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, siteUrl } from "@/lib/seo/site-url";

describe("siteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lit NEXT_PUBLIC_SITE_URL sans barre finale", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemple.fr/");
    expect(siteUrl()).toBe("https://exemple.fr");
    expect(absoluteUrl("/devis")).toBe("https://exemple.fr/devis");
    expect(absoluteUrl("cgv")).toBe("https://exemple.fr/cgv");
  });

  it("retombe sur localhost en développement", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
