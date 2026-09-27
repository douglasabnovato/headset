/*
 * api.test.ts · Testes de integração da API: autenticação, permissões,
 * CRUD de produtos, cotação, pedido transacional com estoque, histórico,
 * relatórios, cache e fila.
 */
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { criarApp } from "../src/app.js";
import { criarDb } from "../src/db/client.js";
import { popular } from "../src/db/seed.js";
import { products, orders } from "../src/db/schema.js";
import { eq, count } from "drizzle-orm";

let ctx: ReturnType<typeof criarApp>;
const CARTAO = "4111 1111 1111 1111";

/* Cria um agente com sessão (cookie) já autenticada. */
async function logar(email: string, senha: string) {
  const agente = request.agent(ctx.app);
  const r = await agente.post("/api/auth/login").send({ email, password: senha });
  expect(r.status).toBe(200);
  return agente;
}

/* Monta um corpo de pedido válido para os itens informados. */
function pedido(items: { productId: number; quantity: number }[]) {
  return {
    items,
    customer: { name: "Maria Souza", email: "maria@exemplo.com", phone: "(32) 98836-7667" },
    address: { cep: "36010-000", street: "Rua Halfeld", number: "100", district: "Centro", city: "Juiz de Fora", state: "MG" },
    payment: { cardNumber: CARTAO, holder: "MARIA SOUZA", expiry: "12/30", cvv: "123" },
  };
}

beforeEach(async () => {
  const db = criarDb(":memory:");
  await popular(db, { pedidos: 10 });
  ctx = criarApp({ db, limitarLogin: false });
});

describe("autenticação", () => {
  it("valida o cadastro e cria a sessão em cookie httpOnly", async () => {
    const ruim = await request(ctx.app).post("/api/auth/register").send({ name: "Jo", email: "x", password: "123" });
    expect(ruim.status).toBe(422);
    expect(ruim.body.details.map((d: any) => d.campo)).toEqual(expect.arrayContaining(["name", "email", "password"]));
    const ok = await request(ctx.app).post("/api/auth/register").send({ name: "João Silva", email: "joao@exemplo.com", password: "senha1234" });
    expect(ok.status).toBe(201);
    expect(ok.headers["set-cookie"][0]).toMatch(/HttpOnly/);
    const dup = await request(ctx.app).post("/api/auth/register").send({ name: "João Silva", email: "joao@exemplo.com", password: "senha1234" });
    expect(dup.status).toBe(409);
  });

  it("recusa senha errada e protege /me", async () => {
    expect((await request(ctx.app).post("/api/auth/login").send({ email: "admin@headset.dev", password: "errada" })).status).toBe(401);
    expect((await request(ctx.app).get("/api/auth/me")).body.user).toBeNull();
    const a = await logar("admin@headset.dev", "Admin@123");
    expect((await a.get("/api/auth/me")).body.user.role).toBe("admin");
    await a.post("/api/auth/logout");
    expect((await a.get("/api/auth/me")).body.user).toBeNull();
  });
});

describe("produtos", () => {
  it("lista com filtros, paginação e cache", async () => {
    const r = await request(ctx.app).get("/api/products?type=in-ear");
    expect(r.status).toBe(200);
    expect(r.body.items.every((p: any) => p.type === "in-ear")).toBe(true);
    await request(ctx.app).get("/api/products?type=in-ear");
    expect(ctx.cache.acertos).toBeGreaterThan(0);
    const pagina = await request(ctx.app).get("/api/products?page=2");
    expect(pagina.body.page).toBe(2);
    expect((await request(ctx.app).get("/api/products?type=violao")).status).toBe(422);
  });

  it("só admin cria, edita e exclui", async () => {
    const novo = { name: "Teste Fone", description: "Descrição com mais de dez letras.", price: "199,90", type: "in-ear", connection: "cabo", color: "Azul", stock: 5, imageUrl: "/produtos/x.svg" };
    expect((await request(ctx.app).post("/api/products").send(novo)).status).toBe(401);
    const cliente = await logar("cliente@headset.dev", "Cliente@123");
    expect((await cliente.post("/api/products").send(novo)).status).toBe(403);
    const admin = await logar("admin@headset.dev", "Admin@123");
    const erro = await admin.post("/api/products").send({ ...novo, price: "-1", imageUrl: "" });
    expect(erro.status).toBe(422);
    const criado = await admin.post("/api/products").send(novo);
    expect(criado.status).toBe(201);
    expect(criado.body.product.priceCents).toBe(19990);
    expect(criado.body.product.slug).toBe("teste-fone");
    const editado = await admin.put(`/api/products/${criado.body.product.id}`).send({ ...novo, price: 249 });
    expect(editado.body.product.priceCents).toBe(24900);
    expect((await admin.delete(`/api/products/${criado.body.product.id}`)).status).toBe(204);
  });

  it("inativa em vez de excluir produto já vendido e recusa upload inválido", async () => {
    const admin = await logar("admin@headset.dev", "Admin@123");
    const vendido = ctx.db.select().from(orders).get()!;
    const item = ctx.db.query.orderItems.findFirst({ where: (t, { eq }) => eq(t.orderId, vendido.id) }).sync()!;
    const r = await admin.delete(`/api/products/${item.productId}`);
    expect(r.body.inactivated).toBe(true);
    const upload = await admin.post("/api/products").field("name", "Com arquivo").field("description", "Descrição válida aqui.").field("price", "10").field("type", "gamer").field("connection", "cabo").field("color", "Preto").field("stock", "1").attach("image", Buffer.from("texto"), { filename: "a.txt", contentType: "text/plain" });
    expect(upload.status).toBe(422);
  });
});

describe("pedidos", () => {
  it("cota o carrinho com o preço do servidor", async () => {
    const p = ctx.db.select().from(products).where(eq(products.slug, "aura-studio-grafite")).get()!;
    const r = await request(ctx.app).post("/api/cart/quote").send({ items: [{ productId: p.id, quantity: 2, priceCents: 1 }] });
    expect(r.body.subtotalCents).toBe(p.priceCents * 2);
  });

  it("cria pedido em transação, baixa estoque e enfileira o e-mail", async () => {
    const p = ctx.db.select().from(products).where(eq(products.slug, "aura-studio-grafite")).get()!;
    ctx.db.update(products).set({ stock: 3 }).where(eq(products.id, p.id)).run();
    expect((await request(ctx.app).post("/api/orders").send(pedido([{ productId: p.id, quantity: 1 }]))).status).toBe(401);
    const cliente = await logar("cliente@headset.dev", "Cliente@123");
    const cartaoRuim = await cliente.post("/api/orders").send({ ...pedido([{ productId: p.id, quantity: 1 }]), payment: { cardNumber: "4111 1111 1111 1112", holder: "M S", expiry: "01/20", cvv: "1" } });
    expect(cartaoRuim.status).toBe(422);
    expect(cartaoRuim.body.details.map((d: any) => d.campo)).toEqual(expect.arrayContaining(["payment.cardNumber", "payment.expiry", "payment.cvv"]));
    const ok = await cliente.post("/api/orders").send(pedido([{ productId: p.id, quantity: 2 }]));
    expect(ok.status).toBe(201);
    expect(ok.body.order.cardLast4).toBe("1111");
    expect(ok.body.order.items[0].unitPriceCents).toBe(p.priceCents);
    expect(ctx.db.select().from(products).where(eq(products.id, p.id)).get()!.stock).toBe(1);
    await ctx.fila.drenar();
    expect(ctx.fila.processadas).toContain("email-confirmacao");
  });

  it("não grava nada quando falta estoque em um dos itens", async () => {
    const [a, b] = ctx.db.select().from(products).limit(2).all();
    ctx.db.update(products).set({ stock: 5 }).where(eq(products.id, a.id)).run();
    ctx.db.update(products).set({ stock: 1 }).where(eq(products.id, b.id)).run();
    const antes = ctx.db.select({ n: count() }).from(orders).get()!.n;
    const cliente = await logar("cliente@headset.dev", "Cliente@123");
    const r = await cliente.post("/api/orders").send(pedido([{ productId: a.id, quantity: 2 }, { productId: b.id, quantity: 3 }]));
    expect(r.status).toBe(409);
    expect(ctx.db.select({ n: count() }).from(orders).get()!.n).toBe(antes);
    expect(ctx.db.select().from(products).where(eq(products.id, a.id)).get()!.stock).toBe(5);
  });

  it("histórico mostra só os pedidos do próprio cliente", async () => {
    const cliente = await logar("cliente@headset.dev", "Cliente@123");
    const lista = await cliente.get("/api/orders");
    expect(lista.body.orders.length).toBeGreaterThan(0);
    const me = (await cliente.get("/api/auth/me")).body.user;
    expect(lista.body.orders.every((o: any) => o.userId === me.id)).toBe(true);
    const outro = ctx.db.select().from(orders).all().find((o) => o.userId !== me.id)!;
    expect((await cliente.get(`/api/orders/${outro.id}`)).status).toBe(404);
  });
});

describe("relatórios", () => {
  it("são restritos ao admin e ordenados por volume", async () => {
    const cliente = await logar("cliente@headset.dev", "Cliente@123");
    expect((await cliente.get("/api/reports/top-customers")).status).toBe(403);
    const admin = await logar("admin@headset.dev", "Admin@123");
    const estados = (await admin.get("/api/reports/sales-by-state")).body.rows;
    expect(estados[0].totalCents).toBeGreaterThanOrEqual(estados.at(-1).totalCents);
    const top = (await admin.get("/api/reports/top-customers")).body.rows;
    expect(top.length).toBeLessThanOrEqual(5);
  });
});
/* fim de api.test.ts */
