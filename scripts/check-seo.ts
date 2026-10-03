/**
 * Contrôle SEO d’un site en cours d’exécution (05-tests.md §6).
 * Usage : BASE_URL=http://localhost:3100 npm run check-seo
 * - sitemap = 9 pages diagnostic + 252 pages ville + pages statiques + articles publiés ;
 * - titres uniques (≤ 60 caractères), description ≤ 155 ;
 * - un canonical absolu, un seul H1 et un JSON-LD valide par page.
 */
import { COMMUNES, DIAGNOSTIC_IDS, LOCAL_DIAGNOSTIC_IDS } from "../src/lib/data/lookup";
import { db } from "./lib/admin";

const BASE = (process.env.BASE_URL ?? "http://localhost:3100").replace(/\/+$/, "");
const STATIC = [
  "/",
  "/devis",
  "/zones-intervention",
  "/conseils",
  "/mentions-legales",
  "/cgv",
  "/confidentialite",
];
const KNOWN_TYPES = new Set([
  "ProfessionalService",
  "Service",
  "FAQPage",
  "BreadcrumbList",
  "Article",
]);

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

async function check(url: string, titles: Map<string, string>) {
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== 200) return fail(`${url} : statut ${res.status}`);
  const html = await res.text();
  const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "");
  if (!title) fail(`${url} : pas de <title>`);
  else if (title.length > 60) fail(`${url} : titre de ${title.length} caractères`);
  const other = titles.get(title);
  if (other) fail(`${url} : même titre que ${other}`);
  titles.set(title, url);
  const desc = decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "");
  if (!desc) fail(`${url} : pas de description`);
  else if (desc.length > 155) fail(`${url} : description de ${desc.length} caractères`);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (!canonical?.startsWith("http")) fail(`${url} : canonical absent ou relatif`);
  else if (new URL(canonical).pathname !== new URL(url).pathname)
    fail(`${url} : canonical ${canonical}`);
  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) fail(`${url} : ${h1} H1`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) fail(`${url} : aucun JSON-LD`);
  for (const [, json] of blocks) {
    try {
      const data = JSON.parse(json ?? "") as { "@context"?: string; "@type"?: string };
      if (data["@context"] !== "https://schema.org") fail(`${url} : JSON-LD sans @context`);
      if (!data["@type"] || !KNOWN_TYPES.has(data["@type"]))
        fail(`${url} : JSON-LD de type ${data["@type"]}`);
    } catch {
      fail(`${url} : JSON-LD illisible`);
    }
  }
}

async function main() {
  const published = (await db.collection("articles").where("published", "==", true).get()).size;
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
  const expected =
    DIAGNOSTIC_IDS.length +
    LOCAL_DIAGNOSTIC_IDS.length * COMMUNES.length +
    STATIC.length +
    published;
  if (urls.length !== expected) fail(`sitemap : ${urls.length} URL au lieu de ${expected}`);
  // Le sitemap pointe vers NEXT_PUBLIC_SITE_URL : on interroge le serveur local sur le même chemin.
  const paths = urls.map((u) => new URL(u).pathname);
  const titles = new Map<string, string>();
  for (let i = 0; i < paths.length; i += 8) {
    await Promise.all(paths.slice(i, i + 8).map((p) => check(`${BASE}${p}`, titles)));
  }
  console.log(`${paths.length} pages vérifiées, ${errors.length} erreur(s).`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
