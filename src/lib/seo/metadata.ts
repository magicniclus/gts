import type { Metadata } from "next";
import { BRAND_NAME } from "./brand";
import { absoluteUrl } from "./site-url";

/** Métadonnées d’une page publique : titre, description, canonical absolu, Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  noindex,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: BRAND_NAME, locale: "fr_FR", type },
    twitter: { card: "summary_large_image", title, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
