import { absoluteUrl } from "./site-url";

type Crumb = { name: string; href?: string };

export function breadcrumbList(items: readonly Crumb[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  };
}

export function faqPage(faq: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

type Business = { phone: string; email: string; adresse: string };

export function professionalService(s: Business) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${absoluteUrl("/")}#entreprise`,
    name: "GTS Diagnostic",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-navy.png"),
    image: absoluteUrl("/logo-navy.png"),
    founder: { "@type": "Person", name: "Guillaume Tilliet" },
    telephone: s.phone,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      ...(s.adresse ? { streetAddress: s.adresse } : {}),
      addressLocality: "Marseille",
      addressRegion: "Provence-Alpes-Côte d’Azur",
      addressCountry: "FR",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 43.2965, longitude: 5.3698 },
      geoRadius: 50000,
    },
    priceRange: "€€",
  };
}

/** Service + Offre (pages diagnostic et ville). `price` 0 = offert. */
export function serviceOffer({
  name,
  description,
  path,
  price,
  area,
}: {
  name: string;
  description: string;
  path: string;
  price: number;
  area: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    serviceType: name,
    provider: { "@id": `${absoluteUrl("/")}#entreprise` },
    areaServed: { "@type": "City", name: area },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price,
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: price,
        priceCurrency: "EUR",
        valueAddedTaxIncluded: true,
      },
      url: absoluteUrl(path),
    },
  };
}

export function articleLd(a: {
  title: string;
  excerpt: string;
  path: string;
  publishedAt: string;
  updatedAt: string | null;
  coverUrl: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    mainEntityOfPage: absoluteUrl(a.path),
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    ...(a.coverUrl ? { image: [a.coverUrl] } : {}),
    author: { "@type": "Person", name: "Guillaume Tilliet" },
    publisher: { "@id": `${absoluteUrl("/")}#entreprise` },
  };
}
