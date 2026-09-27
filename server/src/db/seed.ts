/*
 * seed.ts · Popula o banco com o catálogo, contas de demonstração e
 * clientes/pedidos gerados com @faker-js/faker (para histórico e relatórios).
 * Executado automaticamente quando o banco está vazio; "npm run db:seed"
 * apaga e recria os dados.
 */
import bcrypt from "bcryptjs";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { count } from "drizzle-orm";
import { criarDb, type DB } from "./client.js";
import { orderItems, orders, products, users } from "./schema.js";
import { CATALOGO } from "./catalogo.js";
import { calcularFrete, slugify } from "../lib/money.js";

const UFS = ["SP", "MG", "RJ", "PR", "RS", "SC", "BA", "PE", "GO", "DF", "CE", "ES"];

/* Popula o banco somente se ainda não houver produtos. */
export async function popularSeVazio(db: DB) {
  const n = db.select({ n: count() }).from(products).get()!.n;
  if (n === 0) await popular(db);
}

/* Insere catálogo, contas e pedidos de exemplo. */
export async function popular(db: DB, { pedidos = 90 } = {}) {
  faker.seed(42);
  const slugs = new Set<string>();
  const inseridos = CATALOGO.map((c) => {
    let slug = slugify(`${c.name} ${c.color}`);
    while (slugs.has(slug)) slug += "-2";
    slugs.add(slug);
    return db
      .insert(products)
      .values({
        name: c.name,
        slug,
        description: c.description,
        priceCents: c.price * 100,
        compareAtCents: c.compareAt ? c.compareAt * 100 : null,
        imageUrl: c.image ?? `/produtos/${slug}.svg`,
        type: c.type,
        connection: c.connection,
        color: c.color,
        stock: faker.helpers.weightedArrayElement([{ weight: 1, value: 0 }, { weight: 2, value: faker.number.int({ min: 1, max: 4 }) }, { weight: 7, value: faker.number.int({ min: 8, max: 80 }) }]),
      })
      .returning()
      .get();
  });

  const hashAdmin = await bcrypt.hash("Admin@123", 10);
  const hashCliente = await bcrypt.hash("Cliente@123", 10);
  db.insert(users).values({ name: "Administração Headset", email: "admin@headset.dev", passwordHash: hashAdmin, role: "admin", state: "MG" }).run();
  const demo = db.insert(users).values({ name: "Cliente Demonstração", email: "cliente@headset.dev", passwordHash: hashCliente, state: "MG" }).returning().get();

  const clientes = [demo];
  for (let i = 0; i < 30; i++) {
    const nome = faker.person.fullName();
    clientes.push(
      db.insert(users).values({ name: nome, email: `${slugify(nome).replace(/-/g, ".")}.${i}@exemplo.com.br`, passwordHash: hashCliente, state: faker.helpers.arrayElement(UFS) }).returning().get()
    );
  }

  const vendaveis = inseridos.filter((p) => p.stock > 0);
  for (let i = 0; i < pedidos; i++) {
    const cliente = i < 3 ? demo : faker.helpers.arrayElement(clientes);
    const escolhidos = faker.helpers.arrayElements(vendaveis, { min: 1, max: 3 });
    const linhas = escolhidos.map((p) => {
      const q = faker.number.int({ min: 1, max: 2 });
      return { p, q, total: p.priceCents * q };
    });
    const subtotal = linhas.reduce((s, l) => s + l.total, 0);
    const frete = calcularFrete(subtotal);
    const uf = cliente.state ?? faker.helpers.arrayElement(UFS);
    const data = faker.date.between({ from: "2025-10-01", to: "2026-09-20" }).toISOString().replace("T", " ").slice(0, 19);
    const o = db
      .insert(orders)
      .values({
        userId: cliente.id,
        status: faker.helpers.weightedArrayElement([{ weight: 6, value: "entregue" as const }, { weight: 2, value: "enviado" as const }, { weight: 1, value: "pago" as const }, { weight: 1, value: "cancelado" as const }]),
        subtotalCents: subtotal,
        shippingCents: frete,
        totalCents: subtotal + frete,
        customerName: cliente.name,
        email: cliente.email,
        phone: `329${faker.string.numeric(8)}`,
        cep: faker.location.zipCode("########"),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        district: faker.location.county(),
        city: faker.location.city(),
        state: uf,
        cardLast4: faker.string.numeric(4),
        createdAt: data,
      })
      .returning()
      .get();
    for (const l of linhas) {
      db.insert(orderItems).values({ orderId: o.id, productId: l.p.id, productName: l.p.name, unitPriceCents: l.p.priceCents, quantity: l.q, totalCents: l.total }).run();
    }
  }
}

/* Apaga tudo e popula de novo (npm run db:seed). */
async function recriar() {
  const db = criarDb();
  db.delete(orderItems).run();
  db.delete(orders).run();
  db.delete(products).run();
  db.delete(users).run();
  await popular(db);
  console.info("Banco recriado com dados de exemplo.");
}

if (process.argv[1]?.endsWith("seed.ts")) await recriar();
/* fim de seed.ts */
