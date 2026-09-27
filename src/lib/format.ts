/*
 * format.ts · Formatação de moeda, datas e status para exibição.
 */
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* Centavos → "R$ 1.299,00". */
export function moeda(cents: number) {
  return brl.format(cents / 100);
}

/* Data ISO/SQLite → "12 de setembro de 2026". */
export function data(iso: string) {
  return new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z")).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export const STATUS: Record<string, { rotulo: string; cor: string }> = {
  pago: { rotulo: "Pagamento aprovado", cor: "info" },
  enviado: { rotulo: "Enviado", cor: "primary" },
  entregue: { rotulo: "Entregue", cor: "success" },
  cancelado: { rotulo: "Cancelado", cor: "secondary" },
};
/* fim de format.ts */
