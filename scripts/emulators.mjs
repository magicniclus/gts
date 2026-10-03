/**
 * Lance une commande dans les émulateurs Firebase, sur Windows comme sur macOS / Linux.
 * Usage : node scripts/emulators.mjs [--ui] [--persist] "<commande>"
 *   --ui       ouvre l’interface des émulateurs (http://127.0.0.1:4000) ;
 *   --persist  recharge et sauvegarde les données dans .emulator-data.
 * Les arguments sont passés sans shell : aucun souci de guillemets sous PowerShell / cmd.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import "./predev.mjs";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const command = args.filter((a) => !a.startsWith("--")).join(" ");
if (!command) {
  console.error('Usage : node scripts/emulators.mjs [--ui] [--persist] "<commande>"');
  process.exit(1);
}

const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Compile la Cloud Function (chargée par l’émulateur Functions).
const require = createRequire(import.meta.url);
run(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", "functions/tsconfig.json"]);

const firebase = require.resolve("firebase-tools/lib/bin/firebase.js");
run(process.execPath, [
  firebase,
  "emulators:exec",
  "--project",
  "demo-gts",
  "--only",
  "auth,firestore,storage,functions",
  ...(flags.has("--ui") ? ["--ui"] : []),
  ...(flags.has("--persist") ? ["--import=.emulator-data", "--export-on-exit"] : []),
  command,
]);
