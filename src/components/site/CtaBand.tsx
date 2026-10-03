import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/domain/routes";
import { telHref } from "./PhoneLink";

/** Bandeau d’appel à l’action navy, en bas des pages publiques (sauf /devis). */
export function CtaBand({ phone }: { phone: string }) {
  return (
    <section className="container-site py-[clamp(40px,5vw,72px)]">
      <div className="flex flex-wrap items-center justify-between gap-7 rounded-band bg-accent-900 bg-[radial-gradient(60%_120%_at_100%_0%,color-mix(in_srgb,var(--color-accent)_55%,transparent),transparent_70%)] p-[clamp(32px,5vw,64px)] text-white">
        <div className="max-w-[620px]">
          <h2 className="m-0 font-heading text-[clamp(28px,3.4vw,44px)] leading-[1.06] font-extrabold tracking-[-0.02em] stretch-115">
            Vous vendez ou louez ? <span className="text-accent-400">Sachez-le en 2 minutes.</span>
          </h2>
          <p className="mt-3.5 mb-0 text-[17px] leading-relaxed text-white/80">
            Diagnostics obligatoires identifiés, estimation immédiate, devis ferme sous 2 h ouvrées.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={routes.devis()} size="xl" icon="arrow-right">
            Commencer mon devis
          </Button>
          <Button
            href={telHref(phone)}
            size="xl"
            variant="outlineOnDark"
            icon="phone"
            iconPosition="start"
          >
            {phone}
          </Button>
        </div>
      </div>
    </section>
  );
}
