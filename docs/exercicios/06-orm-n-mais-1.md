# Exercício 6 · Eloquent (ORM): vantagens, desvantagens e N+1

**Vantagens**: produtividade (models, relações, *scopes*), segurança contra SQL injection via *bindings*, migrations e factories, eventos/observers, legibilidade.

**Desvantagens**: esconde o SQL (é fácil gerar consultas ruins sem perceber), *overhead* de hidratar objetos em volumes grandes, *Active Record* mistura regra de negócio e persistência, consultas analíticas complexas ficam menos claras que SQL.

## O problema N+1
```php
$pedidos = Pedido::all();              // 1 query
foreach ($pedidos as $p) {
    echo $p->cliente->nome;            // +1 query por pedido → N+1
}
```
**Correção**: *eager loading* — `Pedido::with('cliente', 'itens.produto')->get()` (3 queries no total). Ferramentas: `Model::preventLazyLoading()` em desenvolvimento, Laravel Debugbar/Telescope para contar queries.

## No projeto (Drizzle ORM)
O histórico de pedidos carrega pedido → itens → produto numa única chamada relacional:
```ts
db.query.orders.findMany({ where: eq(orders.userId, id), with: { items: { with: { product: { columns: { slug: true, imageUrl: true } } } } } })
```
E o transformer (`server/src/transformers/orderItem.ts`) recebe os dados já carregados — ele não busca nada, então não há como gerar N+1 (ver exercício 11).

Para relatórios, preferi o *query builder* com `GROUP BY` (exercício 14): agregação no banco, não em laços no código.
