import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/espace-proprietaire", "/api/", "/dev/", "/devis?"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
