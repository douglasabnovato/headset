# Exercício 5 · Memcached / ElastiCache com MySQL (RDS)

**Por quê?** O RDS é o recurso mais caro e difícil de escalar. Muitas leituras se repetem (catálogo, página de produto, configurações). Um cache em memória responde em microssegundos e tira essas leituras do banco.

**Como ajuda a escalar**
- A aplicação (várias instâncias atrás de um load balancer) compartilha o mesmo cache (ElastiCache Memcached/Redis), então escalar a camada web não multiplica consultas.
- O banco fica livre para escritas e consultas que não podem ser cacheadas; adia a necessidade de réplicas ou de uma instância maior.
- Sessões e *rate limit* também podem morar no cache (Redis), deixando os servidores *stateless*.

**Padrões**
- *Cache-aside*: `Cache::remember('produtos:...', 60, fn() => ...)` — implementado em `server/src/lib/cache.ts` com `lembrar(chave, ttl, gerar)`.
- **Invalidação** nas escritas (o admin salvou → `cache.invalidar("produtos:")`) + TTL curto como rede de segurança.
- Chaves com versão/filtros e cuidado com *cache stampede* (lock ou TTL com variação aleatória).

**Memcached × Redis**: Memcached é simples e multithread (chave-valor puro); Redis tem estruturas de dados, persistência, pub/sub e filas — por isso costuma ser a escolha no ElastiCache para Laravel (cache, sessão e queue no mesmo serviço).

> Limitação honesta do projeto: o cache aqui é em memória do processo (1 instância). Em produção com várias instâncias, trocar a implementação por Redis mantendo a mesma interface.
