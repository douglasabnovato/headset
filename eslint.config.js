/* Lint do front e da API: regras recomendadas de JavaScript, TypeScript e hooks do React */
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "server/node_modules", "server/drizzle", "server/uploads", "test-results", "playwright-report"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  { rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },
  /* Nos testes, o corpo das respostas não tem tipo próprio */
  { files: ["server/tests/**"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
);
/* fim de eslint.config.js */
