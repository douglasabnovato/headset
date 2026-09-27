/*
 * client.ts · Conexão SQLite (better-sqlite3) + Drizzle, com migrações
 * aplicadas na inicialização. DATABASE_URL=":memory:" gera um banco isolado
 * para os testes.
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";
import { config } from "../config.js";

export type DB = BetterSQLite3Database<typeof schema>;

/* Abre o banco, liga chaves estrangeiras e WAL e aplica as migrações pendentes. */
export function criarDb(url = config.databaseUrl): DB {
  if (url !== ":memory:") fs.mkdirSync(path.dirname(url), { recursive: true });
  const sqlite = new Database(url);
  sqlite.pragma("foreign_keys = ON");
  if (url !== ":memory:") sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: config.pastaMigracoes });
  return db;
}
/* fim de client.ts */
