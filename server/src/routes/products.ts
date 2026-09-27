/*
 * products.ts · Catálogo público e CRUD de produtos (exercício 10).
 * Leitura aberta com filtros, ordenação, paginação e cache; escrita só para
 * admin, com upload de imagem (PNG/JPG/WebP até 2 MB) ou URL.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { and, asc, desc, eq, like, or, sql, count } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { products, orderItems } from "../db/schema.js";
import { HttpError } from "../lib/errors.js";
import { slugify } from "../lib/money.js";
import type { Cache } from "../lib/cache.js";
import { exigirAdmin } from "../middleware/auth.js";
import { config } from "../config.js";

const TIPOS = ["over-ear", "on-ear", "in-ear", "gamer"] as const;
const CONEXOES = ["bluetooth", "cabo", "2.4ghz"] as const;
const POR_PAGINA = 12;

const filtroSchema = z.object({
  q: z.string().trim().max(80).optional(),
  type: z.enum(TIPOS).optional(),
  connection: z.enum(CONEXOES).optional(),
  sort: z.enum(["relevancia", "menor-preco", "maior-preco", "novidades"]).default("relevancia"),
  page: z.coerce.number().int().min(1).default(1),
  all: z.enum(["1"]).optional(),
});

const reais = z.preprocess(
  (v) => (typeof v === "string" ? Number(v.replace(/\./g, "").replace(",", ".")) : v),
  z.number({ error: "Informe um preço válido." }).positive("O preço deve ser maior que zero.").max(100000, "Preço acima do limite.")
);

const produtoSchema = z.object({
  name: z.string().trim().min(3, "O nome precisa de pelo menos 3 caracteres.").max(120),
  description: z.string().trim().min(10, "A descrição precisa de pelo menos 10 caracteres.").max(2000),
  price: reais,
  compareAt: z.union([z.literal(""), reais]).optional(),
  type: z.enum(TIPOS, { error: "Escolha o tipo." }),
  connection: z.enum(CONEXOES, { error: "Escolha a conexão." }),
  color: z.string().trim().min(2, "Informe a cor.").max(40),
  stock: z.coerce.number({ error: "Informe o estoque." }).int("Use um número inteiro.").min(0, "O estoque não pode ser negativo.").max(99999),
  active: z.preprocess((v) => v === true || v === "true" || v === "1" || v === "on", z.boolean()).default(true),
  imageUrl: z.string().trim().max(500).optional(),
});

/* Monta o roteador de produtos. */
export function rotasProdutos(db: DB, cache: Cache) {
  const r = Router();
  fs.mkdirSync(config.pastaUploads, { recursive: true });
  const upload = multer({
    storage: multer.diskStorage({
      destination: config.pastaUploads,
      filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) cb(null, true);
      else cb(new HttpError(422, "Envie uma imagem PNG, JPG ou WebP.", [{ campo: "image", mensagem: "Formato não aceito." }]));
    },
  });

  /* Converte o registro do banco para o formato público. */
  const publico = (p: typeof products.$inferSelect) => ({ ...p });

  r.get("/", (req, res) => {
    const f = filtroSchema.parse(req.query);
    const incluirInativos = f.all === "1" && req.user?.role === "admin";
    const chave = `produtos:${JSON.stringify({ ...f, incluirInativos })}`;
    const resultado = cache.lembrar(chave, 60_000, () => {
      const cond = [
        incluirInativos ? undefined : eq(products.active, true),
        f.type ? eq(products.type, f.type) : undefined,
        f.connection ? eq(products.connection, f.connection) : undefined,
        f.q ? or(like(products.name, `%${f.q}%`), like(products.description, `%${f.q}%`), like(products.color, `%${f.q}%`)) : undefined,
      ].filter(Boolean);
      const where = cond.length ? and(...(cond as any[])) : undefined;
      const ordem =
        f.sort === "menor-preco" ? [asc(products.priceCents)] : f.sort === "maior-preco" ? [desc(products.priceCents)] : f.sort === "novidades" ? [desc(products.id)] : [desc(sql`${products.stock} > 0`), asc(products.id)];
      const total = db.select({ n: count() }).from(products).where(where).get()!.n;
      const itens = db.select().from(products).where(where).orderBy(...ordem).limit(POR_PAGINA).offset((f.page - 1) * POR_PAGINA).all();
      return { items: itens.map(publico), total, page: f.page, perPage: POR_PAGINA, pages: Math.max(1, Math.ceil(total / POR_PAGINA)) };
    });
    res.set("Cache-Control", "no-cache");
    res.json(resultado);
  });

  r.get("/:slug", (req, res) => {
    const chave = req.params.slug;
    const p = db
      .select()
      .from(products)
      .where(/^\d+$/.test(chave) ? eq(products.id, Number(chave)) : eq(products.slug, chave))
      .get();
    if (!p || (!p.active && req.user?.role !== "admin")) throw new HttpError(404, "Produto não encontrado.");
    res.json({ product: publico(p) });
  });

  /* Valida o corpo, resolve a imagem e devolve os valores para gravar. */
  const montar = (body: unknown, arquivo: Express.Multer.File | undefined, exigirImagem: boolean) => {
    const d = produtoSchema.parse(body);
    const imageUrl = arquivo ? `/uploads/${arquivo.filename}` : d.imageUrl || undefined;
    if (exigirImagem && !imageUrl) throw new HttpError(422, "Confira os campos destacados.", [{ campo: "image", mensagem: "Envie uma imagem ou informe a URL." }]);
    if (d.compareAt && d.compareAt <= d.price) throw new HttpError(422, "Confira os campos destacados.", [{ campo: "compareAt", mensagem: "O preço 'de' deve ser maior que o preço de venda." }]);
    return {
      name: d.name,
      description: d.description,
      priceCents: Math.round(d.price * 100),
      compareAtCents: d.compareAt ? Math.round(d.compareAt * 100) : null,
      type: d.type,
      connection: d.connection,
      color: d.color,
      stock: d.stock,
      active: d.active,
      ...(imageUrl ? { imageUrl } : {}),
    };
  };

  /* Gera um slug único a partir do nome. */
  const slugUnico = (nome: string, ignorarId?: number) => {
    const base = slugify(nome) || "produto";
    let slug = base;
    for (let i = 2; ; i++) {
      const ex = db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).get();
      if (!ex || ex.id === ignorarId) return slug;
      slug = `${base}-${i}`;
    }
  };

  /* Apaga do disco uma imagem enviada anteriormente. */
  const apagarUpload = (url?: string | null) => {
    if (url?.startsWith("/uploads/")) fs.rm(path.join(config.pastaUploads, path.basename(url)), { force: true }, () => {});
  };

  r.post("/", exigirAdmin, upload.single("image"), (req, res) => {
    try {
      const v = montar(req.body, req.file, true);
      const p = db.insert(products).values({ ...(v as any), slug: slugUnico(v.name) }).returning().get();
      cache.invalidar("produtos:");
      res.status(201).json({ product: publico(p) });
    } catch (e) {
      apagarUpload(req.file && `/uploads/${req.file.filename}`);
      throw e;
    }
  });

  r.put("/:id", exigirAdmin, upload.single("image"), (req, res) => {
    const id = Number(req.params.id);
    const atual = db.select().from(products).where(eq(products.id, id)).get();
    if (!atual) throw new HttpError(404, "Produto não encontrado.");
    try {
      const v = montar(req.body, req.file, false);
      const p = db
        .update(products)
        .set({ ...v, slug: slugUnico(v.name, id), updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(products.id, id))
        .returning()
        .get();
      if (v.imageUrl && v.imageUrl !== atual.imageUrl) apagarUpload(atual.imageUrl);
      cache.invalidar("produtos:");
      res.json({ product: publico(p) });
    } catch (e) {
      apagarUpload(req.file && `/uploads/${req.file.filename}`);
      throw e;
    }
  });

  r.delete("/:id", exigirAdmin, (req, res) => {
    const id = Number(req.params.id);
    const atual = db.select().from(products).where(eq(products.id, id)).get();
    if (!atual) throw new HttpError(404, "Produto não encontrado.");
    const vendido = db.select({ n: count() }).from(orderItems).where(eq(orderItems.productId, id)).get()!.n > 0;
    if (vendido) {
      db.update(products).set({ active: false }).where(eq(products.id, id)).run();
      cache.invalidar("produtos:");
      return res.json({ inactivated: true, message: "O produto já tem vendas no histórico e foi inativado em vez de excluído." });
    }
    db.delete(products).where(eq(products.id, id)).run();
    apagarUpload(atual.imageUrl);
    cache.invalidar("produtos:");
    res.status(204).end();
  });

  return r;
}
/* fim de products.ts */
