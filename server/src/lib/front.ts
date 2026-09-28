/*
 * front.ts · Entrega o build do front (dist/) pela própria API em produção:
 * mesma origem para o cookie de sessão, cache longo nos arquivos com hash e
 * index.html para as rotas do React. Também calcula os hashes dos scripts
 * inline do index.html para a política de segurança de conteúdo (CSP).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import express, { type Express } from "express";

export type Front = { pasta: string; index: string; hashesScripts: string[] };

/* Lê o index.html do build; devolve null se o front não foi buildado. */
export function carregarFront(pasta: string): Front | null {
  const arquivo = path.join(pasta, "index.html");
  if (!fs.existsSync(arquivo)) return null;
  const index = fs.readFileSync(arquivo, "utf8");
  const hashesScripts = [...index.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    ([, codigo]) => `'sha256-${crypto.createHash("sha256").update(codigo).digest("base64")}'`
  );
  return { pasta, index, hashesScripts };
}

/* Registra os arquivos estáticos e o fallback de SPA (depois das rotas da API). */
export function servirFront(app: Express, front: Front) {
  app.use("/assets", express.static(path.join(front.pasta, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(front.pasta, { index: false, maxAge: "1h" }));
  app.use((req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) || !req.accepts("html")) return next();
    res.set("Cache-Control", "no-cache").type("html").send(front.index);
  });
}
/* fim de front.ts */
