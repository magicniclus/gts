"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";
import { routes } from "@/lib/domain/routes";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** « pending » côté serveur : rien n’est rendu avant hydratation (pas de clignotement du bandeau). */
const useConsent = () =>
  useSyncExternalStore<ConsentChoice | null | "pending">(
    subscribe,
    () => readConsent(),
    () => "pending",
  );

/**
 * Bandeau cookies léger (Accepter / Refuser) et GA4 avec Google Consent Mode v2.
 * GA4 n’est chargé qu’après acceptation ; tous les signaux publicitaires restent refusés.
 */
export function ConsentBanner({ gaId }: { gaId: string }) {
  const consent = useConsent();
  return (
    <>
      {consent === "granted" && (
        <>
          <Script id="ga-consent" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('consent','update',{analytics_storage:'granted'});
gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{anonymize_ip:true});`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
        </>
      )}
      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookies"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-[760px] flex-wrap items-center gap-x-6 gap-y-3 rounded-card bg-accent-900 px-5 py-4 text-sm text-white/88 shadow-hero"
        >
          <p className="m-0 min-w-[240px] flex-1 leading-normal">
            Nous utilisons Google Analytics pour mesurer l’audience du site, uniquement avec votre
            accord.{" "}
            <Link
              href={routes.legal("confidentialite")}
              className="font-semibold text-white underline hover:text-white"
            >
              En savoir plus
            </Link>
          </p>
          <div className="flex gap-2">
            <Button variant="outlineOnDark" size="sm" onClick={() => writeConsent("denied")}>
              Refuser
            </Button>
            <Button size="sm" onClick={() => writeConsent("granted")}>
              Accepter
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Lien du pied de page pour revenir sur son choix. */
export function ConsentReset() {
  return (
    <button
      type="button"
      onClick={() => {
        import("@/lib/consent").then((m) => m.clearConsent());
      }}
      className="cursor-pointer text-inherit hover:text-white"
    >
      Cookies
    </button>
  );
}
