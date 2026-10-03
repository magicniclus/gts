/**
 * Remplit Firestore avec docs/handoff/data/settings-defaults.json.
 * Usage : npm run seed [-- --force] [-- --exemples]
 *   --force     écrase les documents existants (sinon, seuls les absents sont créés) ;
 *   --exemples  ajoute les leads de démonstration (émulateur uniquement).
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  DEFAULT_ARTICLES,
  DEFAULT_PRICING,
  DEFAULT_SITE,
  defaultLegalPage,
} from "../src/lib/defaults";
import { LEGAL_DOCS } from "../src/lib/schemas/content";
import { buildSeedLeads } from "./lib/seed-leads";
import { db, PROJECT_ID, USE_EMULATORS } from "./lib/admin";

const force = process.argv.includes("--force");
const exemples = process.argv.includes("--exemples");

async function put(path: string, data: Record<string, unknown>) {
  const ref = db.doc(path);
  if (!force && (await ref.get()).exists) {
    console.log(`  = ${path} (existe déjà)`);
    return;
  }
  await ref.set({ ...data, updatedAt: FieldValue.serverTimestamp() });
  console.log(`  + ${path}`);
}

const noon = (day: string) => Timestamp.fromDate(new Date(`${day}T12:00:00.000Z`));

async function main() {
  console.log(
    `Seed du projet ${PROJECT_ID}${USE_EMULATORS ? " (émulateur)" : ""}${force ? ", écrasement" : ""}`,
  );
  const { updatedAt: _s, ...site } = DEFAULT_SITE;
  await put("settings/site", site);
  await put("settings/pricing", {
    bands: [...DEFAULT_PRICING.bands],
    grid: DEFAULT_PRICING.grid,
    rules: DEFAULT_PRICING.rules,
  });
  const counters = db.doc("settings/counters");
  if (!(await counters.get()).exists) {
    await counters.set({ leadSeq: 1000 });
    console.log("  + settings/counters");
  }
  for (const doc of LEGAL_DOCS) {
    const { title, body } = defaultLegalPage(doc);
    await put(`legalPages/${doc}`, { title, body });
  }
  for (const a of DEFAULT_ARTICLES) {
    const { id, publishedAt, ...rest } = a;
    await put(`articles/${id}`, {
      ...rest,
      coverUrl: null,
      coverAlt: "",
      publishedAt: noon(publishedAt),
      createdAt: noon(publishedAt),
    });
  }
  if (exemples) {
    if (!USE_EMULATORS) throw new Error("--exemples est réservé à l’émulateur.");
    for (const [id, lead] of buildSeedLeads()) await put(`leads/${id}`, lead);
  }
  console.log("Terminé.");
}

main().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(e);
    process.exit(1);
  },
);
