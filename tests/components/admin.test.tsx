import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { PriceGrid } from "@/components/admin/PriceGrid";
import { ToastProvider } from "@/components/admin/Toast";
import type { ActionResult } from "@/lib/admin/result";
import { toPricingInput, type PricingInput } from "@/lib/schemas/pricing";
import { DEFAULT_PRICING } from "../fixtures/pricing";

const user = userEvent.setup();
const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const ok = async (): Promise<ActionResult> => ({
  ok: true,
  savedAt: "2026-10-03T12:05:00.000Z",
  data: undefined,
});

describe("PriceGrid", () => {
  const initial = toPricingInput(DEFAULT_PRICING);

  it("modifier une cellule appelle l’action avec la bonne clé et le bon index", async () => {
    const save = vi.fn(async (_v: PricingInput) => ok());
    wrap(<PriceGrid initial={initial} defaults={initial} updatedAt={null} save={save} />);
    const cell = screen.getByLabelText("Amiante avant travaux, 60 – 100 m²");
    await user.clear(cell);
    await user.type(cell, "300");
    expect(screen.getByText("Modifications non enregistrées")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).toHaveBeenCalledOnce();
    const v = save.mock.calls[0]?.[0];
    expect(v?.grid.raat).toEqual([220, 250, 300, 340, 400]);
    expect(v?.grid.dpe).toEqual([100, 115, 135, 155, 185]);
    expect(await screen.findByText(/Enregistré à/)).toBeInTheDocument();
  });

  it("une valeur négative est refusée", async () => {
    const save = vi.fn(async (_v: PricingInput) => ok());
    wrap(<PriceGrid initial={initial} defaults={initial} updatedAt={null} save={save} />);
    const cell = screen.getByLabelText("DPE logement, < 30 m²");
    await user.clear(cell);
    await user.type(cell, "-5");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save).not.toHaveBeenCalled();
    expect(cell).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("Les prix doivent être des nombres entiers positifs."),
    ).toBeInTheDocument();
  });

  it("modifie une règle et rétablit les tarifs par défaut", async () => {
    const save = vi.fn(async (_v: PricingInput) => ok());
    const custom = {
      ...initial,
      grid: { ...initial.grid, dpe: [1, 2, 3, 4, 5] as PricingInput["grid"]["dpe"] },
    };
    wrap(<PriceGrid initial={custom} defaults={initial} updatedAt={null} save={save} />);
    await user.click(screen.getByRole("button", { name: "Rétablir les tarifs par défaut" }));
    const rule = screen.getByLabelText("Remise pack");
    await user.clear(rule);
    await user.type(rule, "10");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(save.mock.calls[0]?.[0].grid.dpe).toEqual([100, 115, 135, 155, 185]);
    expect(save.mock.calls[0]?.[0].rules.packPct).toBe(10);
  });

  it("accessible", async () => {
    const { container } = wrap(
      <PriceGrid
        initial={initial}
        defaults={initial}
        updatedAt="2026-10-03T12:05:00.000Z"
        save={ok}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
