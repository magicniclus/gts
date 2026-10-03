import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/domain/routes";
import { Logo } from "./Logo";
import { PhoneLink } from "./PhoneLink";

/** En-tête collant, sans menu : logo, téléphone, bouton devis. */
export function SiteHeader({ phone, logoUrl }: { phone: string; logoUrl?: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-divider bg-white/94 backdrop-blur-[10px]">
      <div className="container-site flex flex-wrap items-center gap-x-8 gap-y-3 py-2.5">
        <Link href={routes.home()} aria-label="GTS Diagnostic, accueil" className="block flex-none">
          <Logo tone="navy" src={logoUrl} width={82} priority />
        </Link>
        <span className="flex-1" />
        <PhoneLink phone={phone} />
        <Button href={routes.devis()} icon="arrow-right">
          Devis gratuit
        </Button>
      </div>
    </header>
  );
}
