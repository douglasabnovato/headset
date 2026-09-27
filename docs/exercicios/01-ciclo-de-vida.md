# Exercício 1 · Ciclo de vida de componentes e performance

> Pergunta original: ciclo de vida em Vue.js. Este projeto usa React; a resposta cobre os dois e aponta onde isso aparece no código.

## Vue.js
1. **Criação** — `setup()` (ou `beforeCreate`/`created` na Options API): estado reativo, `computed` e `watch` são registrados. Ainda não há DOM.
2. **Montagem** — `onBeforeMount` → renderiza o template → `onMounted`: o DOM existe; é o lugar de buscar dados que dependem dele, ligar ouvintes e bibliotecas de terceiros.
3. **Atualização** — uma dependência reativa muda → `onBeforeUpdate` → *re-render* do Virtual DOM e *patch* → `onUpdated`.
4. **Desmontagem** — `onBeforeUnmount` → `onUnmounted`: limpar timers, ouvintes, `AbortController`, instâncias de gráficos.
5. Com `<KeepAlive>`: `onActivated` / `onDeactivated` no lugar de montar/desmontar.

## React (usado aqui)
- **Render** é uma função pura do estado; **commit** aplica no DOM; `useEffect(fn, deps)` roda depois do commit e sua função de retorno é a limpeza (equivale a `onMounted` + `onUnmounted`, e a `watch` quando há dependências).
- Exemplos no projeto: `useApi` (busca com flag `ativo` para ignorar respostas de páginas já desmontadas), `useCotacao` (espera de 250 ms e `clearTimeout` na limpeza), `Header` (tema aplicado no `<html>` após o commit).

## Impacto na performance
| Problema | Causa no ciclo de vida | Solução aplicada |
|---|---|---|
| Vazamento de memória / setState em componente morto | efeito sem limpeza | retorno do `useEffect` cancela timer e ignora a resposta |
| Re-render em cascata | estado global mudando a cada tecla | contexto só com o necessário; busca do topo só dispara ao enviar |
| Requisições repetidas | efeito sem dependências corretas | dependência na chave da URL (`useApi`) e na assinatura do carrinho (`useCotacao`) |
| Bundle inicial grande | tudo montado de uma vez | rotas com `lazy()` + `Suspense` (cada página vira um chunk) |
| Trabalho pesado no render | cálculo a cada render | `useMemo` para o total do carrinho |

Em Vue as mesmas ideias: `computed` (cache por dependência) em vez de métodos no template, `v-once`/`v-memo` para trechos estáticos, `shallowRef` para listas grandes, `defineAsyncComponent` para dividir o bundle e sempre desfazer em `onUnmounted` o que foi feito em `onMounted`.
