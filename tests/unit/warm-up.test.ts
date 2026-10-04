import { afterEach, describe, expect, it, vi } from "vitest";

const adminDb = vi.fn();
vi.mock("@/lib/firebase/admin", () => ({ adminDb: () => adminDb() }));

import { warmUpFirestore } from "@/lib/firebase/warm-up";

describe("préchauffage Firestore", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lit settings/site", async () => {
    const get = vi.fn(async () => ({}));
    const doc = vi.fn(() => ({ get }));
    adminDb.mockReturnValue({ doc });
    await warmUpFirestore();
    expect(doc).toHaveBeenCalledWith("settings/site");
    expect(get).toHaveBeenCalled();
  });

  it("ne lève jamais : identifiants invalides ou lecture refusée", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    adminDb.mockImplementation(() => {
      throw new Error("Failed to parse private key");
    });
    await expect(warmUpFirestore()).resolves.toBeUndefined();
    adminDb.mockReturnValue({
      doc: () => ({ get: async () => Promise.reject(new Error("PERMISSION_DENIED")) }),
    });
    await expect(warmUpFirestore()).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledTimes(2);
  });
});
