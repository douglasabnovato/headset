/*
 * orders.ts · Cotação do carrinho, criação de pedido (transação) e histórico.
 * O preço é sempre recalculado no servidor; o pedido, os itens e a baixa de
 * estoque acontecem numa única transação (exercício 8).
 */
import { Router } from "express";
import { z } from "zod";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { orders, orderItems, products, users } from "../db/schema.js";
import { HttpError } from "../lib/errors.js";
import { calcularFrete } from "../lib/money.js";
import type { Cache } from "../lib/cache.js";
import type { Fila } from "../lib/queue.js";
import { exigirLogin } from "../middleware/auth.js";
import { cartaoValido, cepOk, telefoneOk, validadeOk } from "../lib/validators.js";
import { transformarItem } from "../transformers/orderItem.js";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"] as const;

const itensSchema = z
  .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) }))
  .min(1, "O carrinho está vazio.")
  .max(50);

const pedidoSchema = z.object({
  items: itensSchema,
  customer: z.object({
    name: z.string().trim().min(3, "Informe o nome completo.").refine((v) => v.includes(" "), "Informe nome e sobrenome."),
    email: z.email("Informe um e-mail válido."),
    phone: z.string().refine(telefoneOk, "Informe um telefone com DDD."),
  }),
  address: z.object({
    cep: z.string().refine(cepOk, "Informe um CEP com 8 dígitos."),
    street: z.string().trim().min(2, "Informe a rua."),
    number: z.string().trim().min(1, "Informe o número.").max(10),
    district: z.string().trim().min(2, "Informe o bairro."),
    city: z.string().trim().min(2, "Informe a cidade."),
    state: z.enum(UFS, { error: "Informe a UF." }),
  }),
  payment: z.object({
    cardNumber: z.string().refine(cartaoValido, "Número de cartão inválido."),
    holder: z.string().trim().min(3, "Informe o nome impresso no cartão."),
    expiry: z.string().refine((v) => validadeOk(v), "Validade inválida ou vencida."),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV com 3 ou 4 dígitos."),
  }),
});

/* Monta o roteador de carrinho e pedidos. */
export function rotasPedidos(db: DB, cache: Cache, fila: Fila) {
  const r = Router();

  /* Busca os produtos dos itens e calcula linhas, subtotal, frete e problemas. */
  const cotar = (itens: z.infer<typeof itensSchema>, conn: Pick<DB, "select"> = db) => {
    const ids = [...new Set(itens.map((i) => i.productId))];
    const encontrados = conn.select().from(products).where(inArray(products.id, ids)).all();
    const mapa = new Map(encontrados.map((p) => [p.id, p]));
    const linhas = itens.map((i) => {
      const p = mapa.get(i.productId);
      const problema = !p || !p.active ? "indisponivel" : p.stock < i.quantity ? "estoque" : null;
      return {
        productId: i.productId,
        quantity: i.quantity,
        product: p ? { id: p.id, name: p.name, slug: p.slug, imageUrl: p.imageUrl, priceCents: p.priceCents, stock: p.stock, active: p.active } : null,
        totalCents: p ? p.priceCents * i.quantity : 0,
        problema,
      };
    });
    const subtotalCents = linhas.filter((l) => !l.problema).reduce((s, l) => s + l.totalCents, 0);
    const shippingCents = calcularFrete(subtotalCents);
    return { linhas, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
  };

  r.post("/cart/quote", (req, res) => {
    const itens = itensSchema.parse(req.body?.items ?? []);
    res.json(cotar(itens));
  });

  r.post("/orders", exigirLogin, (req, res) => {
    const d = pedidoSchema.parse(req.body);
    const pedido = db.transaction((tx) => {
      const cot = cotar(d.items, tx);
      const problemas = cot.linhas.filter((l) => l.problema);
      if (problemas.length) {
        throw new HttpError(409, "Alguns itens mudaram de preço ou estoque. Revise o carrinho.", problemas.map((p) => ({ productId: p.productId, problema: p.problema, disponivel: p.product?.stock ?? 0 })));
      }
      const o = tx
        .insert(orders)
        .values({
          userId: req.user!.id,
          subtotalCents: cot.subtotalCents,
          shippingCents: cot.shippingCents,
          totalCents: cot.totalCents,
          customerName: d.customer.name,
          email: d.customer.email,
          phone: d.customer.phone.replace(/\D/g, ""),
          cep: d.address.cep.replace(/\D/g, ""),
          street: d.address.street,
          number: d.address.number,
          district: d.address.district,
          city: d.address.city,
          state: d.address.state,
          cardLast4: d.payment.cardNumber.replace(/\D/g, "").slice(-4),
        })
        .returning()
        .get();
      for (const l of cot.linhas) {
        tx.insert(orderItems).values({ orderId: o.id, productId: l.productId, productName: l.product!.name, unitPriceCents: l.product!.priceCents, quantity: l.quantity, totalCents: l.totalCents }).run();
        const baixa = tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${l.quantity}` })
          .where(and(eq(products.id, l.productId), sql`${products.stock} >= ${l.quantity}`))
          .run();
        if (baixa.changes !== 1) throw new HttpError(409, "Estoque insuficiente durante a compra. Revise o carrinho.");
      }
      tx.update(users).set({ state: d.address.state }).where(eq(users.id, req.user!.id)).run();
      return o;
    });
    cache.invalidar("produtos:");
    fila.enfileirar("email-confirmacao", { orderId: pedido.id, email: pedido.email, total: pedido.totalCents });
    res.status(201).json({ order: buscarPedido(pedido.id) });
  });

  /* Carrega um pedido com itens e produtos numa só consulta (sem N+1). */
  const buscarPedido = (id: number) => {
    const o = db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: { with: { product: { columns: { slug: true, imageUrl: true, active: true, type: true } } } } },
    }).sync();
    if (!o) return null;
    return { ...o, items: o.items.map(transformarItem) };
  };

  r.get("/orders", exigirLogin, (req, res) => {
    const lista = db.query.orders.findMany({
      where: eq(orders.userId, req.user!.id),
      orderBy: [desc(orders.createdAt), desc(orders.id)],
      with: { items: { with: { product: { columns: { slug: true, imageUrl: true, active: true, type: true } } } } },
    }).sync();
    res.json({ orders: lista.map((o) => ({ ...o, items: o.items.map(transformarItem) })) });
  });

  r.get("/orders/:id", exigirLogin, (req, res) => {
    const o = buscarPedido(Number(req.params.id));
    if (!o || (o.userId !== req.user!.id && req.user!.role !== "admin")) throw new HttpError(404, "Pedido não encontrado.");
    res.json({ order: o });
  });

  return r;
}
/* fim de orders.ts */
