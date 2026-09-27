/*
 * errors.ts · Tratamento centralizado de erros e log de tempo por rota.
 * Toda falha vira JSON { error, details }; erros de validação do zod
 * viram 422 com a lista de campos.
 */
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { HttpError } from "../lib/errors.js";

/* Converte qualquer erro em resposta JSON padronizada. */
export function tratarErros(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message }));
    return res.status(422).json({ error: "Confira os campos destacados.", details });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 2 MB." : "Não foi possível enviar a imagem.";
    return res.status(422).json({ error: msg });
  }
  console.error(err);
  return res.status(500).json({ error: "Erro inesperado. Tente novamente em instantes." });
}

/* Mede o tempo de cada requisição e avisa quando passa de 300 ms (exercício 3). */
export function medirTempo(req: Request, res: Response, next: NextFunction) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    if (ms > 300) console.warn(`[lento] ${req.method} ${req.originalUrl} ${ms.toFixed(0)}ms`);
  });
  next();
}
/* fim de errors.ts */
