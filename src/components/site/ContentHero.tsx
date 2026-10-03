import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FactsRow, type Fact } from "./FactsRow";
import { telHref } from "./PhoneLink";

type Props = {
  crumbs: readonly BreadcrumbItem[];
  path: string;
  icon: string;
  h1a: string;
  h1b: string;
  intro: string;
  cta: string;
  devisHref: string;
  phone: string;
  facts: readonly Fact[];
};

/** Hero navy des pages diagnostic et ville : fil d’Ariane, H1 en deux parties, faits clés. */
export function ContentHero({
  crumbs,
  path,
  icon,
  h1a,
  h1b,
  intro,
  cta,
  devisHref,
  phone,
  facts,
}: Props) {
  return (
    <section className="bg-accent-900 bg-[radial-gradient(50%_80%_at_90%_0%,color-mix(in_srgb,var(--color-accent)_38%,transparent),transparent_70%)] text-white">
      <div className="container-site pt-7 pb-[clamp(48px,6vw,80px)]">
        <Breadcrumbs items={crumbs} currentPath={path} />
        <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-10">
          <div>
            <span className="grid size-[60px] place-items-center rounded-card bg-white/10 text-accent-400">
              <Icon name={icon} size={32} />
            </span>
            <h1 className="mt-[22px] mb-0 font-heading text-[clamp(34px,4.6vw,58px)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance stretch-115">
              {h1a} <span className="text-accent-400">{h1b}</span>
            </h1>
            <p className="mt-5 mb-0 max-w-[56ch] text-lg leading-relaxed text-white/82">{intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                href={devisHref}
                size="lg"
                icon="arrow-right"
                className="max-w-full whitespace-normal"
              >
                {cta}
              </Button>
              <Button
                href={telHref(phone)}
                size="lg"
                variant="outlineOnDark"
                icon="phone"
                iconPosition="start"
              >
                {phone}
              </Button>
            </div>
          </div>
          <FactsRow facts={facts} />
        </div>
      </div>
    </section>
  );
}
