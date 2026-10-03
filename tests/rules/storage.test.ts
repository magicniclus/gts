import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, describe, it } from "vitest";

let env: RulesTestEnvironment;
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
const jpeg = { contentType: "image/jpeg" };

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-gts-rules",
    storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), "site/portrait.jpg"), png, jpeg);
  });
});
afterAll(() => env.cleanup());

const anon = () => env.unauthenticatedContext().storage();
const user = () => env.authenticatedContext("u1").storage();
const admin = () => env.authenticatedContext("admin1", { admin: true }).storage();

describe("Storage", () => {
  it("lecture publique", async () => {
    await assertSucceeds(getBytes(ref(anon(), "site/portrait.jpg")));
  });
  it("un anonyme ou un utilisateur sans claim n’envoie rien", async () => {
    await assertFails(uploadBytes(ref(anon(), "site/portrait.jpg"), png, jpeg));
    await assertFails(uploadBytes(ref(user(), "articles/a1/cover.jpg"), png, jpeg));
    await assertFails(deleteObject(ref(user(), "site/portrait.jpg")));
  });
  it("un admin envoie des images de moins de 5 Mo", async () => {
    await assertSucceeds(
      uploadBytes(ref(admin(), "site/logo-light.png"), png, { contentType: "image/png" }),
    );
    await assertSucceeds(uploadBytes(ref(admin(), "articles/a1/cover.jpg"), png, jpeg));
  });
  it("un admin ne peut pas envoyer autre chose qu’une image", async () => {
    await assertFails(
      uploadBytes(ref(admin(), "site/x.pdf"), png, { contentType: "application/pdf" }),
    );
  });
  it("un admin est limité à 5 Mo", async () => {
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    await assertFails(uploadBytes(ref(admin(), "site/portrait.jpg"), big, jpeg));
  });
  it("rien en dehors de site/ et articles/", async () => {
    await assertFails(uploadBytes(ref(admin(), "autre/x.jpg"), png, jpeg));
  });
  it("un admin supprime", async () => {
    await assertSucceeds(deleteObject(ref(admin(), "site/logo-light.png")));
  });
});
