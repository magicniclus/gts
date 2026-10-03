import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-nocheck": true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Le domaine est pur : ni React, ni Next, ni Firebase.
    files: ["src/lib/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "react/*"],
              message: "lib/domain est pur.",
            },
            { group: ["next", "next/*"], message: "lib/domain est pur." },
            {
              group: [
                "firebase",
                "firebase/*",
                "firebase-admin",
                "firebase-admin/*",
              ],
              message: "lib/domain est pur.",
            },
          ],
        },
      ],
    },
  },
  {
    // Jamais de couleur en dur dans un composant : passer par les tokens de globals.css.
    files: ["src/components/**/*.tsx", "src/app/**/*.tsx"],
    ignores: ["src/app/**/opengraph-image.tsx", "src/app/**/icon.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Couleur en dur interdite : utilisez un token (globals.css).",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Couleur en dur interdite : utilisez un token (globals.css).",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "docs/**",
    "functions/lib/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
