import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));
const stub = fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url));

/** Les tests d’émulateur ne tournent que dans « firebase emulators:exec » (variable posée par la CLI). */
const inEmulators = !!process.env.FIREBASE_EMULATOR_HUB;

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": src, "server-only": stub } },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", environment: "node", include: ["tests/unit/**/*.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["tests/setup-dom.ts"],
        },
      },
      ...(inEmulators
        ? [
            {
              extends: true,
              test: {
                name: "emulator",
                environment: "node",
                include: ["tests/rules/**/*.test.ts", "tests/integration/**/*.test.ts"],
                fileParallelism: false,
                testTimeout: 30_000,
                env: { NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-gts", IP_HASH_SALT: "sel-de-test" },
              },
            },
          ]
        : []),
    ],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/components/**/*.tsx"],
      exclude: [
        "src/lib/firebase/client.ts",
        "src/lib/firebase/app-check.ts",
        "src/lib/repos/articles.ts",
        "src/lib/repos/legal.ts",
        "src/lib/repos/leads.ts",
        "src/components/ui/icon-paths.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
        "src/lib/domain/**": { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  },
});
