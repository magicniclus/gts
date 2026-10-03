import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqPage } from "@/lib/seo/jsonld";

export type Qa = { q: string; a: string };

/** Liste de questions repliables + JSON-LD FAQPage. */
export function FaqList({
  faq,
  surface = "transparent",
  size = "md",
}: {
  faq: readonly Qa[];
  surface?: "white" | "transparent";
  size?: "md" | "lg";
}) {
  return (
    <>
      <div className="grid gap-2.5">
        {faq.map((x) => (
          <Accordion key={x.q} question={x.q} surface={surface} size={size}>
            <p className="m-0">{x.a}</p>
          </Accordion>
        ))}
      </div>
      <JsonLd data={faqPage(faq)} />
    </>
  );
}

export function FaqSection({ title, faq }: { title: string; faq: readonly Qa[] }) {
  return (
    <div>
      <h2 className="m-0 font-heading text-[clamp(26px,3vw,36px)] leading-[1.1] font-extrabold text-accent-900 stretch-112">
        {title}
      </h2>
      <div className="mt-6">
        <FaqList faq={faq} />
      </div>
    </div>
  );
}
