import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { DevisWizard } from "@/components/devis/DevisWizard";
import { DRAFT_KEY } from "@/lib/devis-draft";
import type { SubmitLeadResult } from "@/lib/leads/types";
import type { SubmitLeadInput } from "@/lib/schemas/lead";
import { DEFAULT_PRICING } from "../fixtures/pricing";

vi.mock("@/lib/firebase/app-check", () => ({ getAppCheckToken: async () => undefined }));

const PHONE = "06 12 34 56 78";
const user = userEvent.setup();
const tile = (name: string | RegExp) => screen.getByRole("button", { name });
const next = () => screen.getByRole("button", { name: /Continuer|Envoyer ma demande/ });
const total = () => screen.getByTestId("total").textContent;

function setup(
  submit = vi.fn(async (_input: SubmitLeadInput): Promise<SubmitLeadResult> => ({
    ok: true,
    ref: "L-1001",
    total: 540,
    surDevis: false,
  })),
) {
  render(<DevisWizard pricing={DEFAULT_PRICING} phone={PHONE} submit={submit} />);
  return submit;
}

/** Cas A jusqu’à l’étape Diagnostics. */
async function fillCaseA() {
  await user.click(tile(/Je vends mon bien/));
  await user.click(next());
  await user.click(tile("Appartement"));
  await user.selectOptions(screen.getByLabelText("Commune"), "marseille-8e");
  await user.click(tile("30 – 60 m²"));
  await user.click(tile("Oui"));
  await user.click(next());
  await user.click(tile(/Avant 1949/));
  const gaz = screen.getByRole("group", { name: "Installation gaz" });
  await user.click(within(gaz).getByRole("button", { name: "Plus de 15 ans" }));
  const elec = screen.getByRole("group", { name: "Installation électrique" });
  await user.click(within(elec).getByRole("button", { name: "Plus de 15 ans" }));
  await user.click(next());
}

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/devis");
  window.scrollTo = vi.fn();
});

describe("DevisWizard", () => {
  it("impossible d’avancer sans réponse", async () => {
    setup();
    expect(next()).toBeDisabled();
    await user.click(tile(/Je vends mon bien/));
    expect(next()).toBeEnabled();
  });

  it("« Location » fait apparaître « Type de location »", async () => {
    setup();
    expect(screen.queryByRole("group", { name: "Type de location" })).toBeNull();
    await user.click(tile(/Je mets en location/));
    expect(screen.getByRole("group", { name: "Type de location" })).toBeInTheDocument();
    expect(next()).toBeDisabled();
    await user.click(tile("Location vide"));
    expect(next()).toBeEnabled();
  });

  it("« Travaux » fait apparaître « Nature du chantier »", async () => {
    setup();
    await user.click(tile(/Travaux ou démolition/));
    expect(screen.getByRole("group", { name: "Nature du chantier" })).toBeInTheDocument();
  });

  it("cas A : 540 €, décocher un diagnostic met le total à jour", async () => {
    setup();
    await fillCaseA();
    expect(screen.getByRole("heading", { name: "Vos diagnostics" })).toBeInTheDocument();
    expect(total()).toBe("540 €");
    await user.click(screen.getByRole("button", { name: /Diagnostic de performance énergétique/ }));
    expect(total()).toBe("440 €");
  });

  it("le badge de remise apparaît au 3ᵉ diagnostic payant", async () => {
    setup();
    await fillCaseA();
    const toggleOff = [
      "Constat de repérage amiante",
      "Constat de risque",
      "Diagnostic électricité",
      "Diagnostic gaz",
      "Mesurage loi Carrez",
    ];
    for (const name of toggleOff)
      await user.click(screen.getByRole("button", { name: new RegExp(name) }));
    // Restent DPE + termites (+ ERP offert) : 2 diagnostics payants.
    expect(screen.queryByText(/Remise pack/)).toBeNull();
    await user.click(screen.getByRole("button", { name: /Mesurage loi Carrez/ }));
    expect(screen.getByText(/Remise pack −15/)).toBeInTheDocument();
  });

  it("envoie les réponses et les cases cochées, jamais de prix", async () => {
    const submit = setup();
    await fillCaseA();
    await user.click(next());
    await user.click(tile(/Cette semaine/));
    await user.click(next());
    await user.type(screen.getByLabelText("Nom et prénom"), "Sophie Marchetti");
    await user.type(screen.getByLabelText("Téléphone"), "06 21 44 87 10");
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole("checkbox"));
    await user.click(next());
    expect(submit).toHaveBeenCalledOnce();
    const arg = submit.mock.calls[0]?.[0];
    expect(arg).toMatchObject({
      answers: { projet: "vente", commune: "marseille-8e", annee: "avant1949", delai: "semaine" },
      contact: { nom: "Sophie Marchetti", profil: "particulier" },
      checked: ["dpe", "amiante", "plomb", "electricite", "gaz", "carrez", "termites", "erp"],
      consent: true,
      website: "",
    });
    expect(JSON.stringify(arg)).not.toMatch(/total|price/);
    expect(await screen.findByTestId("lead-ref")).toHaveTextContent("L-1001");
  });

  it("affiche l’erreur du serveur", async () => {
    setup(
      vi.fn(async (_input: SubmitLeadInput): Promise<SubmitLeadResult> => ({
        ok: false,
        error: "Trop de demandes.",
        fieldErrors: { "contact.tel": "Numéro de téléphone invalide." },
      })),
    );
    await fillCaseA();
    await user.click(next());
    await user.click(tile(/Au plus vite/));
    await user.click(next());
    await user.type(screen.getByLabelText("Nom et prénom"), "Karim");
    await user.type(screen.getByLabelText("Téléphone"), "0700000000");
    await user.click(screen.getByRole("checkbox"));
    await user.click(next());
    expect(await screen.findByText("Trop de demandes.")).toBeInTheDocument();
    expect(screen.getByText("Numéro de téléphone invalide.")).toBeInTheDocument();
  });

  it("reprend les réponses de la carte du hero et démarre à l’étape 2", async () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ projet: "vente", type: "maison", commune: "aubagne" }),
    );
    setup();
    expect(await screen.findByRole("heading", { name: "Parlez-nous du bien" })).toBeInTheDocument();
    expect(tile("Maison")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Commune")).toHaveValue("aubagne");
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("pré-remplit la commune passée dans l’URL", async () => {
    window.history.replaceState(null, "", "/devis?commune=la-ciotat");
    setup();
    await user.click(tile(/Je vends mon bien/));
    await user.click(next());
    expect(screen.getByLabelText("Commune")).toHaveValue("la-ciotat");
  });

  it("accessible à chaque étape", async () => {
    const { container } = render(
      <DevisWizard pricing={DEFAULT_PRICING} phone={PHONE} submit={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
    await fillCaseA();
    expect(await axe(container)).toHaveNoViolations();
  });
});
