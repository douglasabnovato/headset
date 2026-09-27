/*
 * reports.ts · Relatórios do exercício 14 (vendas por estado e 5 maiores
 * clientes), escritos com o query builder do Drizzle — equivalentes às
 * queries Eloquent documentadas em docs/sql/14-vendas.sql.
 */
import { Router } from "express";
import { desc, eq, ne, sql, count, sum } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { orders, users } from "../db/schema.js";
import { exigirAdmin } from "../middleware/auth.js";

/* Monta o roteador de relatórios (somente admin). */
export function rotasRelatorios(db: DB) {
  const r = Router();
  r.use(exigirAdmin);

  r.get("/sales-by-state", (_req, res) => {
    const linhas = db
      .select({ state: orders.state, totalCents: sum(orders.totalCents).mapWith(Number), orders: count(orders.id) })
      .from(orders)
      .where(ne(orders.status, "cancelado"))
      .groupBy(orders.state)
      .orderBy(desc(sql`sum(${orders.totalCents})`))
      .all();
    res.json({ rows: linhas });
  });

  r.get("/top-customers", (_req, res) => {
    const linhas = db
      .select({ id: users.id, name: users.name, email: users.email, state: users.state, totalCents: sum(orders.totalCents).mapWith(Number), orders: count(orders.id) })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .where(ne(orders.status, "cancelado"))
      .groupBy(users.id)
      .orderBy(desc(sql`sum(${orders.totalCents})`))
      .limit(5)
      .all();
    res.json({ rows: linhas });
  });

  return r;
}
/* fim de reports.ts */
