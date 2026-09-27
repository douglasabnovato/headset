/*
 * index.ts · Sobe a API. Se o banco estiver vazio, popula com dados de exemplo.
 */
import { criarApp } from "./app.js";
import { config } from "./config.js";
import { popularSeVazio } from "./db/seed.js";

const { app, db } = criarApp();
await popularSeVazio(db);
app.listen(config.porta, () => console.info(`API do Headset Store em http://localhost:${config.porta}`));
/* fim de index.ts */
