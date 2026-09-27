/*
 * auth.ts · Rotas de cadastro, login, logout e sessão atual.
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { users } from "../db/schema.js";
import { HttpError } from "../lib/errors.js";
import { iniciarSessao, encerrarSessao, type Sessao } from "../middleware/auth.js";

const cadastroSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo."),
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "A senha precisa de pelo menos 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha precisa de pelo menos uma letra.")
    .regex(/\d/, "A senha precisa de pelo menos um número."),
});
const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  password: z.string().min(1, "Informe a senha."),
});

/* Monta o roteador de autenticação. */
export function rotasAuth(db: DB, { limitarLogin = true } = {}) {
  const r = Router();
  const limitador = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Muitas tentativas. Aguarde alguns minutos." } });

  /* Converte o usuário do banco na sessão pública. */
  const sessao = (u: typeof users.$inferSelect): Sessao => ({ id: u.id, role: u.role, name: u.name, email: u.email });

  r.post("/register", async (req, res) => {
    const dados = cadastroSchema.parse(req.body);
    const existe = db.select({ id: users.id }).from(users).where(eq(users.email, dados.email)).get();
    if (existe) throw new HttpError(409, "Já existe uma conta com este e-mail.", [{ campo: "email", mensagem: "E-mail já cadastrado." }]);
    const passwordHash = await bcrypt.hash(dados.password, 10);
    const u = db.insert(users).values({ name: dados.name, email: dados.email, passwordHash }).returning().get();
    iniciarSessao(res, sessao(u));
    res.status(201).json({ user: sessao(u) });
  });

  r.post("/login", limitarLogin ? limitador : (_q, _s, n) => n(), async (req, res) => {
    const dados = loginSchema.parse(req.body);
    const u = db.select().from(users).where(eq(users.email, dados.email)).get();
    const ok = u ? await bcrypt.compare(dados.password, u.passwordHash) : false;
    if (!u || !ok) throw new HttpError(401, "E-mail ou senha incorretos.");
    iniciarSessao(res, sessao(u));
    res.json({ user: sessao(u) });
  });

  r.post("/logout", (_req, res) => {
    encerrarSessao(res);
    res.status(204).end();
  });

  r.get("/me", (req, res) => {
    res.json({ user: req.user ?? null });
  });

  return r;
}
/* fim de auth.ts */
