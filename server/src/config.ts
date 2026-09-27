/*
 * config.ts · Configuração da API lida das variáveis de ambiente, com
 * valores seguros para desenvolvimento. Em produção JWT_SECRET é obrigatório.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const producao = process.env.NODE_ENV === "production";

if (producao && !process.env.JWT_SECRET) {
  throw new Error("Defina JWT_SECRET no ambiente de produção.");
}

export const config = {
  producao,
  porta: Number(process.env.PORT ?? 3333),
  databaseUrl: process.env.DATABASE_URL ?? path.join(raiz, "data", "headset.db"),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-troque-em-producao",
  jwtExpiraEm: "2h",
  cookieNome: "headset_session",
  pastaUploads: path.join(raiz, "uploads"),
  pastaMigracoes: path.join(raiz, "drizzle"),
  freteGratisAPartirCents: 29900,
  freteCents: 1990,
};
/* fim de config.ts */
