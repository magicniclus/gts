"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { findCommune } from "@/lib/data/lookup";
import { takeDraft } from "@/lib/devis-draft";
import type { Pricing } from "@/lib/domain/types";
import { getAppCheckToken } from "@/lib/firebase/app-check";
import { computeLead } from "@/lib/leads/compute";
import type { SubmitLeadResult } from "@/lib/leads/types";
import type { SubmitLeadInput } from "@/lib/schemas/lead";
import { DevisSuccess } from "./DevisSuccess";
import { EstimatePanel } from "./EstimatePanel";
import { StepBien } from "./StepBien";
import { StepConstruction } from "./StepConstruction";
import { StepCoordonnees } from "./StepCoordonnees";
import { StepDiagnostics } from "./StepDiagnostics";
import { StepProjet } from "./StepProjet";
import { StepRendezVous } from "./StepRendezVous";
import { Stepper } from "./Stepper";
import { EMPTY_FORM, stepValidity, type DevisForm, type SetField } from "./types";

const CONTACT_KEYS = new Set<keyof DevisForm>([
  "nom",
  "tel",
  "email",
  "message",
  "adresse",
  "profil",
  "consent",
]);

type Props = {
  pricing: Pricing;
  phone: string;
  submit: (input: SubmitLeadInput) => Promise<SubmitLeadResult>;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function DevisWizard({ pricing, phone, submit }: Props) {
  const [f, setF] = useState<DevisForm>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [ov, setOv] = useState<Record<string, boolean>>({});
  const [website, setWebsite] = useState("");
  const [result, setResult] = useState<SubmitLeadResult | null>(null);
  const [pending, startTransition] = useTransition();
  const card = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Réponses transmises par la carte du hero, ou commune passée dans l’URL (pages ville).
  useEffect(() => {
    const draft = takeDraft();
    const params = new URLSearchParams(window.location.search);
    const commune = params.get("commune");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique de sessionStorage au montage
    setF((prev) => ({
      ...prev,
      ...(draft?.projet ? { projet: draft.projet as DevisForm["projet"] } : {}),
      ...(draft?.type ? { type: draft.type as DevisForm["type"] } : {}),
      ...(draft?.commune && findCommune(draft.commune) ? { commune: draft.commune } : {}),
      ...(commune && findCommune(commune) ? { commune } : {}),
    }));
    if (draft?.projet) setStep(1);
  }, []);

  // Focus sur le titre de l’étape à chaque changement (lecteurs d’écran).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    card.current?.querySelector<HTMLElement>("[data-step-title]")?.focus();
  }, [step, result]);

  const set: SetField = (key, value) => {
    setF((prev) => ({ ...prev, [key]: value }));
    // Une nouvelle réponse recalcule les cases par défaut (maquette).
    if (!CONTACT_KEYS.has(key)) setOv({});
  };

  const { rows, estimate, checked } = useMemo(() => {
    const defaults = computeLead(f, pricing).rows;
    const ids = defaults.filter((r) => ov[r.id] ?? r.on).map((r) => r.id);
    const final = computeLead(f, pricing, ids);
    return { ...final, checked: ids };
  }, [f, ov, pricing]);

  const valid = stepValidity(f);
  const last = step === 5;

  const toggle = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (row && row.level !== "Info") setOv((o) => ({ ...o, [id]: !row.on }));
  };

  const send = () => {
    startTransition(async () => {
      const appCheckToken = await getAppCheckToken();
      const { profil, nom, tel, email, consent, ...answers } = f;
      const res = await submit({
        answers: answers as SubmitLeadInput["answers"],
        contact: { profil: profil || "particulier", nom, tel, email },
        checked: checked as SubmitLeadInput["checked"],
        consent: consent as true,
        website,
        appCheckToken,
      });
      setResult(res);
      if (res.ok) {
        window.gtag?.("event", "generate_lead", {
          currency: "EUR",
          value: res.total,
          lead_ref: res.ref,
        });
        window.scrollTo({ top: 0 });
      }
    });
  };

  const next = () => {
    if (!valid[step]) return;
    if (last) send();
    else {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    }
  };

  if (result?.ok) {
    return (
      <div
        ref={(el) => {
          card.current = el;
        }}
      >
        <DevisSuccess
          nom={f.nom}
          tel={f.tel}
          email={f.email}
          refId={result.ref}
          total={result.total}
          surDevis={result.surDevis}
          chosen={rows.filter((r) => r.on).map((r) => r.name)}
        />
      </div>
    );
  }

  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-heading text-[clamp(28px,3.6vw,44px)] leading-[1.06] font-extrabold tracking-[-0.02em] text-accent-900 stretch-115">
          Votre devis <span className="text-accent">en 2 minutes</span>
        </h1>
        <span className="text-sm text-text/70">
          Gratuit · sans engagement · données non revendues
        </span>
      </div>
      <Stepper current={step} valid={valid} onGo={setStep} />
      <div className="mt-6 flex flex-wrap items-start gap-5">
        <form
          ref={(el) => {
            card.current = el;
          }}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="min-w-0 flex-[999_1_480px] rounded-hero bg-white p-[clamp(22px,3vw,40px)] shadow-[0_18px_50px_-24px_rgb(10_26_72/0.2)]"
          aria-label={`Étape ${step + 1} sur 6`}
        >
          {/* Champ piège : invisible pour les humains, rempli par les robots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="dv-website">Site web</label>
            <input
              id="dv-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {step === 0 && <StepProjet f={f} set={set} />}
          {step === 1 && <StepBien f={f} set={set} />}
          {step === 2 && <StepConstruction f={f} set={set} />}
          {step === 3 && <StepDiagnostics rows={rows} onToggle={toggle} />}
          {step === 4 && <StepRendezVous f={f} set={set} />}
          {step === 5 && <StepCoordonnees f={f} set={set} errors={errors} />}

          {result && !result.ok && (
            <p
              role="alert"
              className="mt-6 mb-0 rounded-field bg-danger-bg px-4 py-3 text-sm font-semibold text-danger-fg"
            >
              {result.error}
            </p>
          )}

          <div className="mt-9 flex items-center justify-between gap-3 border-t border-divider pt-6">
            {step > 0 && (
              <Button
                variant="ghost"
                size="lg"
                icon="arrow-left"
                iconPosition="start"
                onClick={() => setStep(step - 1)}
              >
                Retour
              </Button>
            )}
            <span className="flex-1" />
            <Button type="submit" size="xl" icon="arrow-right" disabled={!valid[step] || pending}>
              {last ? (pending ? "Envoi…" : "Envoyer ma demande") : "Continuer"}
            </Button>
          </div>
        </form>
        <EstimatePanel
          f={f}
          rows={rows}
          estimate={estimate}
          packPct={pricing.rules.packPct}
          phone={phone}
        />
      </div>
    </>
  );
}
