/*
 * cache.ts · Cache em memória com TTL e invalidação por prefixo.
 * Demonstra o papel de um Memcached/ElastiCache (exercício 5): leituras
 * repetidas do catálogo não vão ao banco; escritas de admin invalidam.
 * Em produção com várias instâncias, trocar por Redis mantendo a interface.
 */
type Entrada = { valor: unknown; expira: number };

export class Cache {
  private dados = new Map<string, Entrada>();
  acertos = 0;
  falhas = 0;

  /* Devolve o valor em cache ou executa a função e guarda o resultado. */
  lembrar<T>(chave: string, ttlMs: number, gerar: () => T): T {
    const e = this.dados.get(chave);
    if (e && e.expira > Date.now()) {
      this.acertos++;
      return e.valor as T;
    }
    this.falhas++;
    const valor = gerar();
    this.dados.set(chave, { valor, expira: Date.now() + ttlMs });
    return valor;
  }

  /* Remove todas as chaves que começam com o prefixo. */
  invalidar(prefixo: string) {
    for (const k of this.dados.keys()) if (k.startsWith(prefixo)) this.dados.delete(k);
  }
}
/* fim de cache.ts */
