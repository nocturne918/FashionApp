import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "*.config.*",
      ".output/**/*",
      ".github/**/*",
    ],
  },
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];