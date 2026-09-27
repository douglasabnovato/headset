/*
 * auth.ts · Sessão por JWT guardado em cookie httpOnly.
 * O token nunca fica acessível ao JavaScript do navegador (mitiga XSS);
 * SameSite=Lax + API só aceitando JSON/multipart mitigam CSRF.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { HttpError } from "../lib/errors.js";

export type Sessao = { id: number; role: "customer" | "admin"; name: string; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: Sessao;
    }
  }
}

/* Assina o token e grava o cookie de sessão. */
export function iniciarSessao(res: Response, user: Sessao) {
  const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiraEm as jwt.SignOptions["expiresIn"] });
  res.cookie(config.cookieNome, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.producao,
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });
}

/* Apaga o cookie de sessão. */
export function encerrarSessao(res: Response) {
  res.clearCookie(config.cookieNome, { path: "/" });
}

/* Lê o cookie (se houver) e preenche req.user; nunca bloqueia. */
export function lerSessao(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[config.cookieNome];
  if (token) {
    try {
      const { id, role, name, email } = jwt.verify(token, config.jwtSecret) as Sessao;
      req.user = { id, role, name, email };
    } catch {
      req.user = undefined;
    }
  }
  next();
}

/* Exige usuário autenticado. */
export function exigirLogin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw new HttpError(401, "Faça login para continuar.");
  next();
}

/* Exige papel de administrador. */
export function exigirAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw new HttpError(401, "Faça login para continuar.");
  if (req.user.role !== "admin") throw new HttpError(403, "Apenas administradores podem fazer isso.");
  next();
}
/* fim de auth.ts */
