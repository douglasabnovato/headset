/*
 * app.ts · Fábrica da aplicação Express (separada do listen para os testes).
 * Liga segurança, sessão, rotas, arquivos enviados e tratamento de erros; em
 * produção também entrega o front buildado, na mesma origem da API.
 */
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { criarDb, type DB } from "./db/client.js";
import { Cache } from "./lib/cache.js";
import { Fila } from "./lib/queue.js";
import { carregarFront, servirFront } from "./lib/front.js";
import { lerSessao } from "./middleware/auth.js";
import { medirTempo, tratarErros } from "./middleware/errors.js";
import { rotasAuth } from "./routes/auth.js";
import { rotasProdutos } from "./routes/products.js";
import { rotasPedidos } from "./routes/orders.js";
import { rotasRelatorios } from "./routes/reports.js";
import { config } from "./config.js";

const SERVICOS_CEP = ["https://viacep.com.br", "https://brasilapi.com.br", "https://cdn.apicep.com", "https://apps.correios.com.br"];

/* Cria a app com banco, cache e fila (injetáveis nos testes). */
export function criarApp({ db = criarDb(), cache = new Cache(), fila = new Fila(), limitarLogin = true }: { db?: DB; cache?: Cache; fila?: Fila; limitarLogin?: boolean } = {}) {
  const app = express();
  const front = config.producao ? carregarFront(config.pastaFront) : null;
  fila.registrar("email-confirmacao", ({ orderId, email, total }) => {
    console.info(`[e-mail] Pedido #${orderId} confirmado para ${email} · total R$ ${(total / 100).toFixed(2)}`);
  });

  app.disable("x-powered-by");
  if (config.producao) app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "same-site" },
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", ...(front?.hashesScripts ?? [])],
          connectSrc: ["'self'", ...SERVICOS_CEP],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        },
      },
    })
  );
  app.use(medirTempo);
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(lerSessao);

  app.get("/api/health", (_req, res) => res.json({ ok: true, demo: config.demo }));
  app.use("/api/auth", rotasAuth(db, { limitarLogin }));
  app.use("/api/products", rotasProdutos(db, cache));
  app.use("/api", rotasPedidos(db, cache, fila));
  app.use("/api/reports", rotasRelatorios(db));
  app.use("/uploads", express.static(config.pastaUploads, { maxAge: "7d", immutable: true }));
  app.use("/api", (_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
  if (front) servirFront(app, front);
  app.use(tratarErros);

  return { app, db, cache, fila };
}
/* fim de app.ts */
