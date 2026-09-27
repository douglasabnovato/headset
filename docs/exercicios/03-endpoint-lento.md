# Exercício 3 · Endpoint lento: como identificar e resolver

## 1. Medir antes de mexer
- **Onde está o tempo?** Log de duração por rota (implementado em `medirTempo`: avisa acima de 300 ms), APM (New Relic, Datadog, Laravel Telescope/Pulse, OpenTelemetry) e *tracing* por etapa (banco, cache, chamadas externas).
- **Banco**: log de consultas lentas (MySQL `slow_query_log`), `EXPLAIN`/`EXPLAIN ANALYZE`, contagem de queries por requisição (N+1 aparece aqui).
- **Reproduzir**: mesma carga e mesmos dados (um endpoint rápido com 100 linhas pode travar com 1 milhão).

## 2. Causas comuns e correções
| Sintoma | Correção |
|---|---|
| Muitas queries iguais | eager loading (`with`) — ver exercício 6 |
| `EXPLAIN` com *full scan* | índice nas colunas de `WHERE`/`JOIN`/`ORDER BY` (aqui: `products(active, type, connection)`, `orders(user_id, created_at)`) |
| Resposta enorme | paginação (12 por página), selecionar só colunas usadas, compressão |
| Mesmo resultado calculado sempre | cache com invalidação (aqui: listagem em cache de 60 s, limpa quando o admin grava) |
| Chamada externa lenta no meio da requisição | fila assíncrona (e-mail de confirmação vai para a fila) e *timeout* |
| Revalidação de clientes | `ETag` + `Cache-Control: no-cache` (resposta 304 sem corpo) |
| CPU no servidor | perfilar (clinic.js, Xdebug/Blackfire), mover para job, escalar horizontalmente |

## 3. Validar
Comparar p95/p99 antes e depois, com teste de carga (k6, Artillery) e alerta no APM para regressões.
