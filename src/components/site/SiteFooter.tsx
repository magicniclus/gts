import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DIAGNOSTICS, DIAGNOSTIC_IDS, LOCAL_DIAGNOSTIC_IDS, findCommune } from "@/lib/data/lookup";
import { routes } from "@/lib/domain/routes";
import { Logo } from "./Logo";
import { ConsentReset } from "./ConsentBanner";
import { telHref } from "./PhoneLink";

const TOP_COMMUNES = [
  "aix-en-provence",
  "aubagne",
  "la-ciotat",
  "martigues",
  "vitrolles",
  "marignane",
  "cassis",
  "gardanne",
  "allauch",
  "les-pennes-mirabeau",
];

type Col = { title: string; links: { name: string; href: string }[] };

function footerColumns(): Col[] {
  const top = TOP_COMMUNES.map(findCommune).filter((c) => c !== undefined);
  return [
    {
      title: "Diagnostics",
      links: DIAGNOSTIC_IDS.map((id) => ({
        name: DIAGNOSTICS[id].long,
        href: routes.diagnostic(id),
      })),
    },
    ...LOCAL_DIAGNOSTIC_IDS.map((id) => ({
      title: `${DIAGNOSTICS[id].name} par ville`,
      links: top.map((c) => ({
        name: `${DIAGNOSTICS[id].name} ${c.name}`,
        href: routes.city(id, c.slug),
      })),
    })),
  ];
}

export function SiteFooter({
  phone,
  email,
  siret,
  logoUrl,
}: {
  phone: string;
  email: string;
  siret: string;
  logoUrl?: string | null;
}) {
  const year = 2026;
  return (
    <footer className="bg-footer text-white/78">
      <div className="container-site pt-[clamp(48px,6vw,80px)] pb-8 max-md:pb-28">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-8 gap-y-10">
          <div>
            <Logo tone="white" src={logoUrl} width={130} />
            <p className="mt-[18px] mb-0 text-sm leading-relaxed">
              Guillaume Tilliet
              <br />
              Diagnostiqueur immobilier certifié
              <br />
              Marseille · 50 km autour
            </p>
            <a
              href={telHref(phone)}
              className="mt-3.5 inline-flex items-center gap-2 text-[17px] font-extrabold whitespace-nowrap text-white hover:text-white"
            >
              <Icon name="phone" className="text-accent-400" />
              {phone}
            </a>
            {email && (
              <a
                href={`mailto:${email}`}
                className="mt-2 flex items-center gap-2 text-sm text-white/78 hover:text-white"
              >
                <Icon name="envelope-simple" className="text-accent-400" />
                {email}
              </a>
            )}
          </div>
          {footerColumns().map((col) => (
            <div key={col.title}>
              <h3 className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[0.14em] text-white uppercase">
                {col.title}
              </h3>
              <ul className="m-0 grid list-none gap-1.5 p-0 text-sm leading-normal">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/72 hover:text-white">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-x-7 gap-y-3.5 border-t border-white/12 pt-6 text-[13px] text-white/60">
          <span>
            © {year} GTS Diagnostic · SIRET {siret || "à compléter"}
          </span>
          <nav aria-label="Liens secondaires" className="flex flex-wrap gap-5">
            <Link href={routes.articles()} className="text-inherit hover:text-white">
              Conseils &amp; articles
            </Link>
            <Link href={routes.zones()} className="text-inherit hover:text-white">
              Plan du site
            </Link>
            <Link href={routes.legal("mentions-legales")} className="text-inherit hover:text-white">
              Mentions légales
            </Link>
            <Link href={routes.legal("cgv")} className="text-inherit hover:text-white">
              CGV
            </Link>
            <Link href={routes.legal("confidentialite")} className="text-inherit hover:text-white">
              Confidentialité
            </Link>
            {process.env.NEXT_PUBLIC_GA_ID && <ConsentReset />}
            <Link href={routes.admin()} className="text-inherit hover:text-white" prefetch={false}>
              Espace propriétaire
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
