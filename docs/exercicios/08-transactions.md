# Exercício 8 · Quando usar transactions

Sempre que **várias escritas precisam acontecer juntas ou nenhuma** (atomicidade), ou quando uma leitura precisa ser consistente com a escrita seguinte.

Exemplos: criar pedido + itens + baixar estoque; transferência entre contas; trocar o endereço padrão (desmarcar o antigo e marcar o novo); importar um lote que não pode ficar pela metade.

## No projeto (`POST /api/orders`)
```ts
db.transaction((tx) => {
  const cot = cotar(itens, tx);                   // relê preço e estoque dentro da transação
  if (problemas) throw new HttpError(409, ...);   // rollback automático
  const pedido = tx.insert(orders)...;
  for (const l of linhas) {
    tx.insert(orderItems)...;
    const baixa = tx.update(products).set({ stock: sql`stock - ${q}` })
      .where(and(eq(products.id, id), sql`stock >= ${q}`)).run();  // baixa condicional
    if (baixa.changes !== 1) throw new HttpError(409, ...);        // corrida de estoque → rollback
  }
});
```
O teste "não grava nada quando falta estoque em um dos itens" prova que nenhum pedido nem baixa parcial fica no banco.

**Cuidados**: transações curtas (nada de chamadas HTTP ou e-mail dentro — por isso o e-mail vai para a fila depois), atenção a *deadlocks* (ordem consistente de travas) e, em MySQL, `lockForUpdate()`/nível de isolamento quando a regra depender de ler e depois escrever. No Laravel: `DB::transaction(fn () => ..., attempts: 3)`.
