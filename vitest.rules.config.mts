import { defineConfig } from "vitest/config";

/** Tests des règles de sécurité : lancés dans l’émulateur (npm run test:rules). */
export default defineConfig({
  test: {
    name: "rules",
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
