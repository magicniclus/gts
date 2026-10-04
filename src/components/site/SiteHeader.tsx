import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DIAGNOSTICS, DIAGNOSTIC_IDS } from "@/lib/data/lookup";
import { routes } from "@/lib/domain/routes";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { PhoneLink, telHref } from "./PhoneLink";

const MAIN_LINKS = [
  { href: routes.home(), label: "Accueil" },
  { href: routes.devis(), label: "Devis gratuit" },
  { href: routes.zones(), label: "Zones d’intervention" },
  { href: routes.articles(), label: "Conseils & articles" },
] as const;

const DIAGNOSTIC_LINKS = DIAGNOSTIC_IDS.map((id) => ({
  href: routes.diagnostic(id),
  label: DIAGNOSTICS[id].name,
}));

/**
 * En-tête collant : logo, téléphone, bouton devis. Pas de menu sur ordinateur ;
 * sous 768 px, le téléphone laisse la place au menu (et au bouton d’appel flottant).
 */
export function SiteHeader({ phone, logoUrl }: { phone: string; logoUrl?: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-divider bg-white/94 backdrop-blur-[10px]">
      <div className="container-site flex items-center gap-x-8 py-2.5 max-md:gap-x-2">
        <Link href={routes.home()} aria-label="GTS Diagnostic, accueil" className="block flex-none">
          <Logo tone="navy" src={logoUrl} width={82} priority />
        </Link>
        <span className="flex-1" />
        <span className="max-md:hidden">
          <PhoneLink phone={phone} />
        </span>
        <Button href={routes.devis()} icon="arrow-right" className="max-[380px]:px-3.5">
          Devis gratuit
        </Button>
        <MobileMenu
          logo={<Logo tone="navy" src={logoUrl} width={70} />}
          main={MAIN_LINKS}
          diagnostics={DIAGNOSTIC_LINKS}
          footer={
            <a
              href={telHref(phone)}
              className="flex min-h-14 items-center justify-center gap-3 rounded-card bg-accent-900 text-lg font-extrabold text-white stretch-108 hover:bg-accent-800 hover:text-white"
            >
              Appeler le {phone}
            </a>
          }
        />
      </div>
    </header>
  );
}
