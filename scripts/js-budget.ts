/**
 * Mesure le JavaScript chargé par une page (somme gzip des <script src>).
 * Usage : BASE_URL=http://localhost:3100 npx tsx scripts/js-budget.ts / /devis
 */
import { gzipSync } from "node:zlib";

const BASE = (process.env.BASE_URL ?? "http://localhost:3100").replace(/\/+$/, "");
const BUDGET_KB = Number(process.env.JS_BUDGET_KB ?? 0);

async function measure(path: string) {
  const html = await (await fetch(`${BASE}${path}`)).text();
  const srcs = [
    ...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1] ?? "")),
  ];
  let raw = 0;
  let gz = 0;
  for (const src of srcs) {
    const buf = Buffer.from(await (await fetch(new URL(src, BASE))).arrayBuffer());
    raw += buf.length;
    gz += gzipSync(buf, { level: 9 }).length;
  }
  return {
    path,
    scripts: srcs.length,
    rawKb: Math.round(raw / 1024),
    gzipKb: Math.round(gz / 1024),
  };
}

async function main() {
  const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
  let ok = true;
  for (const p of paths) {
    const m = await measure(p);
    console.log(`${m.path} : ${m.scripts} scripts, ${m.rawKb} Ko (${m.gzipKb} Ko gzip)`);
    if (BUDGET_KB && m.gzipKb > BUDGET_KB) ok = false;
  }
  process.exit(ok ? 0 : 1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
