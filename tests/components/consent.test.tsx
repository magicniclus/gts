import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import {
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  clearConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";

beforeEach(() => localStorage.clear());

describe("consentement cookies", () => {
  it("mémorise le choix 6 mois", () => {
    expect(readConsent()).toBeNull();
    writeConsent("granted", 1000);
    expect(readConsent(1000 + CONSENT_MAX_AGE_MS - 1)).toBe("granted");
    expect(readConsent(1000 + CONSENT_MAX_AGE_MS + 1)).toBeNull();
    localStorage.setItem(CONSENT_KEY, "{pas du json");
    expect(readConsent()).toBeNull();
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value: "autre", at: 1 }));
    expect(readConsent()).toBeNull();
  });

  it("bandeau Accepter / Refuser, accessible, puis masqué", async () => {
    const { container } = render(<ConsentBanner gaId="G-TEST" />);
    expect(await screen.findByRole("dialog", { name: "Cookies" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Refuser" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(readConsent()).toBe("denied");
    act(() => clearConsent());
    expect(await screen.findByRole("dialog", { name: "Cookies" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Accepter" }));
    expect(readConsent()).toBe("granted");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
