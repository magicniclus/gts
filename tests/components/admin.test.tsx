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

describe("ImageUploader", () => {
  it("refuse un fichier non image et un fichier de plus de 5 Mo", async () => {
    const { ImageUploader } = await import("@/components/admin/ImageUploader");
    const upload = vi.fn(async (_f: FormData): Promise<ActionResult<string>> => ({
      ok: true,
      savedAt: "",
      data: "u",
    }));
    wrap(
      <ImageUploader
        label="Remplacer"
        maxDim={800}
        fields={{ slot: "portrait" }}
        upload={upload}
        onUploaded={() => {}}
      />,
    );
    const input = screen.getByLabelText("Remplacer");
    const pdf = new File(["%PDF"], "doc.pdf", { type: "application/pdf" });
    await userEvent.upload(input, pdf, { applyAccept: false });
    expect(screen.getByRole("alert")).toHaveTextContent("Ce fichier n’est pas une image.");
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" });
    await userEvent.upload(input, big);
    expect(screen.getByRole("alert")).toHaveTextContent("Image trop lourde : 5 Mo au maximum.");
    expect(upload).not.toHaveBeenCalled();
  });

  it("envoie une image valide avec les champs demandés", async () => {
    const { ImageUploader } = await import("@/components/admin/ImageUploader");
    const upload = vi.fn(async (_f: FormData): Promise<ActionResult<string>> => ({
      ok: true,
      savedAt: "",
      data: "https://x/p.jpg",
    }));
    const onUploaded = vi.fn();
    wrap(
      <ImageUploader
        label="Remplacer"
        maxDim={800}
        fields={{ slot: "portrait" }}
        upload={upload}
        onUploaded={onUploaded}
      />,
    );
    await userEvent.upload(
      screen.getByLabelText("Remplacer"),
      new File([new Uint8Array(10)], "p.jpg", { type: "image/jpeg" }),
    );
    await vi.waitFor(() => expect(onUploaded).toHaveBeenCalledWith("https://x/p.jpg"));
    const form = upload.mock.calls[0]?.[0];
    expect(form?.get("slot")).toBe("portrait");
    expect(form?.get("file")).toBeInstanceOf(File);
  });
});
