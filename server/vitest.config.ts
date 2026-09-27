/*
 * vitest.config.ts · Testes da API com banco SQLite em memória.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { environment: "node", env: { DATABASE_URL: ":memory:" } } });
/* fim de vitest.config.ts */
