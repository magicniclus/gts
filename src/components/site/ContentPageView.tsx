import { JsonLd } from "@/components/ui/JsonLd";
import type { ContentPage } from "@/lib/domain/city-content";
import { serviceOffer } from "@/lib/seo/jsonld";
import { CommuneColumns } from "./CommuneColumns";
import { ContentHero } from "./ContentHero";
import { CtaBand } from "./CtaBand";
import { FaqSection } from "./FaqSection";
import { NumberedBlocks } from "./NumberedBlocks";
import { RelatedLinks } from "./RelatedLinks";

/** Corps commun des pages diagnostic et ville (maquettes Diagnostic / Diagnostic-Ville). */
export function ContentPageView({
  page,
  phone,
  serviceName,
  area,
  price,
}: {
  page: ContentPage;
  phone: string;
  serviceName: string;
  area: string;
  price: number;
}) {
  return (
    <>
      <ContentHero
        crumbs={page.crumbs}
        path={page.path}
        icon={page.icon}
        h1a={page.h1a}
        h1b={page.h1b}
        intro={page.intro}
        cta={page.cta}
        devisHref={page.devisHref}
        phone={phone}
        facts={page.facts}
      />
      <NumberedBlocks blocks={page.blocks} />
      <section className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-x-[clamp(32px,6vw,96px)] gap-y-8 py-[clamp(56px,7vw,96px)]">
        <FaqSection title={page.faqTitle} faq={page.faq} />
        <RelatedLinks title={page.relTitle} links={page.related} neighbors={page.neighbors} />
      </section>
      {page.communes.length > 0 && <CommuneColumns dname={page.dname} communes={page.communes} />}
      <CtaBand phone={phone} />
      <JsonLd
        data={serviceOffer({
          name: serviceName,
          description: page.metaDesc,
          path: page.path,
          price,
          area,
        })}
      />
    </>
  );
}
