import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_SITE } from "@/lib/defaults";
import { adminDb } from "@/lib/firebase/admin";
import type { SiteSettings } from "@/lib/schemas/settings";
import { str, toIso, urlOrNull } from "./convert";
import { TAGS } from "./tags";

/** Normalise un document settings/site ; les champs absents prennent leur valeur par défaut. */
export function parseSiteSettings(data: Record<string, unknown> | undefined): SiteSettings {
  const d = DEFAULT_SITE;
  if (!data) return d;
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const photos = (data.photos ?? {}) as Record<string, unknown>;
  return {
    phone: str(data.phone, d.phone),
    email: str(data.email, d.email),
    hours: str(data.hours, d.hours),
    adresse: str(data.adresse, d.adresse),
    siret: str(data.siret, d.siret),
    certification: str(data.certification, d.certification),
    assurance: str(data.assurance, d.assurance),
    hero: {
      kicker: str(hero.kicker, d.hero.kicker),
      title: str(hero.title, d.hero.title),
      highlight: str(hero.highlight, d.hero.highlight),
      intro: str(hero.intro, d.hero.intro),
    },
    photos: {
      portraitUrl: urlOrNull(photos.portraitUrl),
      portraitAlt: str(photos.portraitAlt, d.photos.portraitAlt),
      logoLightUrl: urlOrNull(photos.logoLightUrl),
      logoDarkUrl: urlOrNull(photos.logoDarkUrl),
    },
    updatedAt: toIso(data.updatedAt),
  };
}

/** Lecture sans cache (espace propriétaire, Server Actions). */
export async function readSiteSettings(): Promise<SiteSettings> {
  const snap = await adminDb().doc("settings/site").get();
  return parseSiteSettings(snap.data());
}

/** Lecture mise en cache pour les pages publiques. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  return readSiteSettings();
}
