/*
 * orderItem.ts · Transformer de item de pedido (versão melhorada do
 * exercício 11). Recebe o item já carregado com o produto (eager loading,
 * sem N+1), usa o snapshot gravado no pedido e trata produto removido.
 */
import type { OrderItem, Product } from "../db/schema.js";

export type ItemComProduto = OrderItem & { product: Pick<Product, "slug" | "imageUrl" | "active" | "type"> | null };

/* Converte o item para o formato público da API. */
export function transformarItem(item: ItemComProduto) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.productName,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    totalCents: item.totalCents,
    product: item.product
      ? { slug: item.product.slug, imageUrl: item.product.imageUrl, active: item.product.active, type: item.product.type }
      : null,
  };
}
/* fim de orderItem.ts */
