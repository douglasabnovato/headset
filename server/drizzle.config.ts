/*
 * drizzle.config.ts · configuração do drizzle-kit para gerar as migrações SQL
 * a partir de src/db/schema.ts (npm run db:generate).
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: "./data/headset.db" },
});
/* fim de drizzle.config.ts */
