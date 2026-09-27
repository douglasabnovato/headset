/*
 * app.ts · Fábrica da aplicação Express (separada do listen para os testes).
 * Liga segurança, sessão, rotas, arquivos enviados e tratamento de erros.
 */
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { criarDb, type DB } from "./db/client.js";
import { Cache } from "./lib/cache.js";
import { Fila } from "./lib/queue.js";
import { lerSessao } from "./middleware/auth.js";
import { medirTempo, tratarErros } from "./middleware/errors.js";
import { rotasAuth } from "./routes/auth.js";
import { rotasProdutos } from "./routes/products.js";
import { rotasPedidos } from "./routes/orders.js";
import { rotasRelatorios } from "./routes/reports.js";
import { config } from "./config.js";

/* Cria a app com banco, cache e fila (injetáveis nos testes). */
export function criarApp({ db = criarDb(), cache = new Cache(), fila = new Fila(), limitarLogin = true }: { db?: DB; cache?: Cache; fila?: Fila; limitarLogin?: boolean } = {}) {
  const app = express();
  fila.registrar("email-confirmacao", ({ orderId, email, total }) => {
    console.info(`[e-mail] Pedido #${orderId} confirmado para ${email} · total R$ ${(total / 100).toFixed(2)}`);
  });

  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(medirTempo);
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(lerSessao);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", rotasAuth(db, { limitarLogin }));
  app.use("/api/products", rotasProdutos(db, cache));
  app.use("/api", rotasPedidos(db, cache, fila));
  app.use("/api/reports", rotasRelatorios(db));
  app.use("/uploads", express.static(config.pastaUploads, { maxAge: "7d", immutable: true }));
  app.use("/api", (_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
  app.use(tratarErros);

  return { app, db, cache, fila };
}
/* fim de app.ts */
