import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** Tests exécutés dans les émulateurs Firebase (npm run test:emu) : règles et intégration serveur. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url)),
    },
  },
  test: {
    name: "emulator",
    environment: "node",
    include: ["tests/rules/**/*.test.ts", "tests/integration/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    env: { NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-gts-int", IP_HASH_SALT: "sel-de-test" },
  },
});
