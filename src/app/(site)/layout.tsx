import { JsonLd } from "@/components/ui/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { UtilityBar } from "@/components/site/UtilityBar";
import { getPricing } from "@/lib/repos/pricing";
import { getSiteSettings } from "@/lib/repos/settings";
import { professionalService } from "@/lib/seo/jsonld";

/** Layout public : barre utilitaire, en-tête, contenu, pied de page. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, pricing] = await Promise.all([getSiteSettings(), getPricing()]);
  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-field bg-accent px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Aller au contenu
      </a>
      <UtilityBar
        hours={site.hours}
        packPct={pricing.rules.packPct}
        packMin={pricing.rules.packMin}
      />
      <SiteHeader phone={site.phone} logoUrl={site.photos.logoLightUrl} />
      <main id="contenu">{children}</main>
      <SiteFooter
        phone={site.phone}
        email={site.email}
        siret={site.siret}
        logoUrl={site.photos.logoDarkUrl}
      />
      <JsonLd data={professionalService(site)} />
    </>
  );
}
