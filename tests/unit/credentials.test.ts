import { describe, expect, it } from "vitest";
import { hasCredentials, serviceAccountFromEnv } from "@/lib/firebase/credentials";

describe("identifiants du compte de service", () => {
  it("e-mail + clé privée, retours à la ligne échappés", () => {
    expect(
      serviceAccountFromEnv({
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "p",
        FIREBASE_CLIENT_EMAIL: "sa@p.iam",
        FIREBASE_PRIVATE_KEY: '"-----BEGIN\\nABC\\n-----END"',
      }),
    ).toEqual({
      projectId: "p",
      clientEmail: "sa@p.iam",
      privateKey: "-----BEGIN\nABC\n-----END",
    });
  });
  it("JSON complet", () => {
    const json = JSON.stringify({ project_id: "p", client_email: "sa@p.iam", private_key: "K" });
    expect(serviceAccountFromEnv({ FIREBASE_SERVICE_ACCOUNT: json })).toEqual({
      projectId: "p",
      clientEmail: "sa@p.iam",
      privateKey: "K",
    });
    expect(() => serviceAccountFromEnv({ FIREBASE_SERVICE_ACCOUNT: "{}" })).toThrow("incomplet");
  });
  it("aucun identifiant, ou chemin de fichier", () => {
    expect(serviceAccountFromEnv({})).toBeNull();
    expect(hasCredentials({})).toBe(false);
    expect(hasCredentials({ GOOGLE_APPLICATION_CREDENTIALS: "C:\\cle.json" })).toBe(true);
  });
});
