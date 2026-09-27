# Exercício 11 · Crítica do transformer de item de pedido

## Problemas
1. **N+1 escondido**: `getProduct()` é chamado 5 vezes e `getSize()` 3 vezes por item. Se forem *lazy loads*, cada item gera várias queries; numa lista de pedidos isso explode.
2. **Sem proteção a nulos**: produto removido ou tamanho inexistente → `Call to a member function ... on null` (o mesmo tipo de erro do exercício 9).
3. **Dado histórico mutável**: nome e `active` vêm do produto **atual**; se o produto for renomeado ou desativado, o pedido antigo muda. O item deveria guardar um *snapshot* (nome, preço) no momento da compra.
4. **Responsabilidades misturadas**: um transformer de item de pedido formatando produto e tamanho; melhor usar *includes* do Fractal (`product`, `size`) com transformers próprios.
5. **Nomenclatura inconsistente**: `item_pedido_id` em português no meio de chaves em inglês; `gender` e `gender_name` duplicam informação.
6. **Tipos e dinheiro**: `price`, `total_price` e `discount` sem formato definido (float?); preferir inteiros em centavos ou string decimal, e deixar claro se `total_price` já tem desconto.
7. **Docblock pobre**: `@return array` sem o formato; sem tipo de retorno na assinatura.

## Versão melhorada (PHP)
```php
/**
 * @return array{id:int, product_id:int, name:string, quantity:int, unit_price:int, discount:int, total:int, size: ?array, product: ?array}
 */
public function transform(ItemPedido $item): array
{
    $produto = $item->relationLoaded('product') ? $item->product : null; // exige eager loading
    $tamanho = $item->relationLoaded('size') ? $item->size : null;

    return [
        'id'         => $item->id,
        'product_id' => $item->product_id,
        'name'       => $item->product_name,      // snapshot gravado no pedido
        'quantity'   => $item->quantity,
        'unit_price' => $item->unit_price_cents,
        'discount'   => $item->discount_cents,
        'total'      => $item->total_cents,
        'size'       => $tamanho ? ['name' => $tamanho->name, 'gender' => $tamanho->gender] : null,
        'product'    => $produto ? ['slug' => $produto->link_rewrite, 'active' => $produto->is_active, 'type' => $produto->type] : null,
    ];
}
// Consulta: ItemPedido::with(['product:id,link_rewrite,is_active,type', 'size'])->where(...)->get();
```

## No projeto
`server/src/transformers/orderItem.ts` aplica isso: usa o snapshot `productName`/`unitPriceCents`, recebe o produto já carregado por `with` e devolve `product: null` quando ele não existe mais.
