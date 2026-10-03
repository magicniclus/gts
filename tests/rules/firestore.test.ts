import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-gts-rules",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "settings/site"), { phone: "06" });
    await setDoc(doc(db, "settings/pricing"), { rules: {} });
    await setDoc(doc(db, "settings/counters"), { leadSeq: 1000 });
    await setDoc(doc(db, "legalPages/cgv"), { title: "CGV", body: "" });
    await setDoc(doc(db, "articles/pub"), { slug: "pub", published: true });
    await setDoc(doc(db, "articles/draft"), { slug: "draft", published: false });
    await setDoc(doc(db, "leads/L-1001"), {
      ref: "L-1001",
      status: "nouveau",
      notes: "",
      total: 540,
    });
    await setDoc(doc(db, "rateLimits/abc"), { count: 1 });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const user = () => env.authenticatedContext("u1", { email: "x@y.fr" }).firestore();
const admin = () => env.authenticatedContext("admin1", { admin: true }).firestore();

describe.each([
  ["anonyme", anon],
  ["connecté sans claim admin", user],
])("%s", (_label, db) => {
  it("lit settings/site, settings/pricing et les pages légales", async () => {
    await assertSucceeds(getDoc(doc(db(), "settings/site")));
    await assertSucceeds(getDoc(doc(db(), "settings/pricing")));
    await assertSucceeds(getDoc(doc(db(), "legalPages/cgv")));
  });
  it("ne lit pas settings/counters", async () => {
    await assertFails(getDoc(doc(db(), "settings/counters")));
  });
  it("lit les articles publiés, pas les brouillons", async () => {
    await assertSucceeds(getDoc(doc(db(), "articles/pub")));
    await assertSucceeds(
      getDocs(query(collection(db(), "articles"), where("published", "==", true))),
    );
    await assertFails(getDoc(doc(db(), "articles/draft")));
    await assertFails(getDocs(collection(db(), "articles")));
  });
  it("aucun accès aux leads", async () => {
    await assertFails(getDoc(doc(db(), "leads/L-1001")));
    await assertFails(getDocs(collection(db(), "leads")));
    await assertFails(setDoc(doc(db(), "leads/L-9999"), { ref: "L-9999" }));
    await assertFails(updateDoc(doc(db(), "leads/L-1001"), { status: "gagne" }));
    await assertFails(deleteDoc(doc(db(), "leads/L-1001")));
  });
  it("n’écrit rien", async () => {
    await assertFails(setDoc(doc(db(), "settings/site"), { phone: "07" }));
    await assertFails(setDoc(doc(db(), "settings/pricing"), {}));
    await assertFails(setDoc(doc(db(), "legalPages/cgv"), { title: "x" }));
    await assertFails(setDoc(doc(db(), "articles/new"), { published: true }));
    await assertFails(updateDoc(doc(db(), "articles/pub"), { title: "x" }));
  });
  it("aucun accès aux limites de débit", async () => {
    await assertFails(getDoc(doc(db(), "rateLimits/abc")));
    await assertFails(setDoc(doc(db(), "rateLimits/abc"), { count: 0 }));
  });
});

describe("admin", () => {
  it("lit et écrit settings, pages légales et articles", async () => {
    const db = admin();
    await assertSucceeds(setDoc(doc(db, "settings/site"), { phone: "07" }));
    await assertSucceeds(setDoc(doc(db, "settings/pricing"), { rules: { maison: 10 } }));
    await assertSucceeds(getDoc(doc(db, "settings/counters")));
    await assertSucceeds(setDoc(doc(db, "legalPages/cgv"), { title: "CGV", body: "x" }));
    await assertSucceeds(getDoc(doc(db, "articles/draft")));
    await assertSucceeds(getDocs(collection(db, "articles")));
    await assertSucceeds(setDoc(doc(db, "articles/new"), { published: false }));
    await assertSucceeds(updateDoc(doc(db, "articles/draft"), { published: true }));
    await assertSucceeds(deleteDoc(doc(db, "articles/pub")));
  });
  it("lit et supprime les leads", async () => {
    const db = admin();
    await assertSucceeds(getDoc(doc(db, "leads/L-1001")));
    await assertSucceeds(getDocs(collection(db, "leads")));
    await assertSucceeds(deleteDoc(doc(db, "leads/L-1001")));
  });
  it("ne modifie que status et notes d’un lead", async () => {
    const db = admin();
    await assertSucceeds(
      updateDoc(doc(db, "leads/L-1001"), { status: "rappele", notes: "Rappeler lundi" }),
    );
    await assertFails(updateDoc(doc(db, "leads/L-1001"), { total: 1 }));
    await assertFails(updateDoc(doc(db, "leads/L-1001"), { status: "inconnu" }));
  });
  it("ne crée pas de lead (seul le serveur le fait)", async () => {
    await assertFails(setDoc(doc(admin(), "leads/L-2000"), { ref: "L-2000", status: "nouveau" }));
  });
  it("aucun accès client aux limites de débit", async () => {
    await assertFails(getDoc(doc(admin(), "rateLimits/abc")));
  });
});
