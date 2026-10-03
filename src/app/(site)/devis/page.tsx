import type { Metadata } from "next";
import { DevisWizard } from "@/components/devis/DevisWizard";
import { getPricing } from "@/lib/repos/pricing";
import { getSiteSettings } from "@/lib/repos/settings";
import { pageMetadata } from "@/lib/seo/metadata";
import { submitLead } from "./actions";

export const metadata: Metadata = pageMetadata({
  title: "Devis diagnostic immobilier gratuit | GTS Diagnostic",
  description:
    "Six questions : les diagnostics obligatoires de votre bien et une estimation immédiate. Marseille et 50 km autour, rapport sous 24 h, devis ferme sous 2 h.",
  path: "/devis",
});

export default async function DevisPage() {
  const [pricing, site] = await Promise.all([getPricing(), getSiteSettings()]);
  return (
    <div className="min-h-[80vh] bg-surface">
      <div className="container-site pt-[clamp(32px,4vw,56px)] pb-[clamp(64px,8vw,112px)]">
        <DevisWizard
          pricing={{ grid: pricing.grid, rules: pricing.rules }}
          phone={site.phone}
          submit={submitLead}
        />
      </div>
    </div>
  );
}
