# Plano de ação — Headset Store

> Criado em 06/11/2026. O estado fica em [`MVP.md`](MVP.md); o histórico anterior, em [`PLANO-ESTRATEGICO.md`](PLANO-ESTRATEGICO.md) e [`AVALIACAO.md`](AVALIACAO.md).

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `main`. Nível: Vitrine (N2), 12 critérios.

### Produto

**Problema e público.** Recrutadores precisam ver, em poucos minutos, que o autor entrega uma loja fullstack completa em TypeScript: vitrine, carrinho, checkout com transação, fila e admin.

**Hipótese e meta.** Quem avalia completa uma compra de demonstração em até 5 minutos pelo link publicado. A meta segue proposta (#19); medir depende da publicação (#4) e de uma ferramenta (#20).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Exigir conta faz parte das pessoas desistir; o checkout de convidado deve ser a opção mais visível | Virou a #22: "Comprar sem cadastro" como primeira opção, com pedido de convidado na mesma transação | [Baymard: estado do checkout](https://baymard.com/blog/current-state-of-checkout-ux), [Baymard: pesquisa de checkout](https://baymard.com/research/checkout-usability) |
| Importar só os módulos do Bootstrap reduz bastante o CSS | Virou a #21: hoje o CSS inteiro (236 KB sem gzip) bloqueia a primeira pintura | [Bootstrap 5.3: otimizar](https://getbootstrap.com/docs/5.3/customize/optimize), [bootstrap.build: reduzir o CSS](https://bootstrap.build/guides/reduce-bootstrap-css-size/) |
| Medir antes e depois, minificado e com gzip | Critério da #21 e da #15 | [bootstrap.build: reduzir o CSS](https://bootstrap.build/guides/reduce-bootstrap-css-size/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Playwright 1.65 (o 1.63 não instala o Chromium no `ubuntu-latest` atual) | Alto | Baixo | Este ciclo |
| 2 | CI também nos PRs para `developer/**` | Alto | Baixo | Este ciclo |
| 3 | `MVP.md` com resumo batendo com a tabela | Alto | Baixo | Este ciclo |
| 4 | Publicar no Render | Alto | Baixo | Responsável (#4) |
| 5 | Proteger a `main` | Alto | Baixo | Responsável (#18) |
| 6 | Reduzir o CSS do Bootstrap | Alto | Médio | Issue #21 |
| 7 | Medir o LCP no ar | Alto | Baixo | Issue #15, depois da #4 |
| 8 | Compra como convidado | Médio | Médio | Issue #22 |
| 9 | Vitest 4 e `drizzle-kit` | Médio | Médio | Issue #23 |
| 10 | Confirmar a meta | Médio | Baixo | Responsável (#19) |
| 11 | Medição de uso | Médio | Médio | Responsável (#20) |

**Fora do escopo.** Pagamento real, banco persistente, estoque real.

### Engenharia

**Arquitetura.** React 19 com Vite, Bootstrap e LESS no front, com rotas carregadas sob demanda. Express com Drizzle ORM e SQLite na API (`server/`), sessão em cookie `httpOnly` e mesma origem. O pedido é criado em transação com baixa de estoque; o e-mail sai por uma fila em memória. Um único serviço do Render entrega API e front (`render.yaml`).

**Riscos.**
- Sem publicação, os critérios 3, 5 e 7 não andam (#4).
- O SQLite do Render volta aos dados de exemplo a cada deploy.
- Sem proteção na `main`, o Render publicaria um push direto sem CI (#18).
- Alertas moderados em dependências de desenvolvimento (#23).

**Qualidade.**
- Testes: 4 do front (Vitest), 10 da API (Vitest + Supertest, banco em memória), 5 de ponta a ponta (Playwright 1.65: compra, axe em 3 telas, teclado).
- Acessibilidade: axe no CI, foco visível, compra iniciada só com teclado.
- Desempenho: 2,79 s de LCP local; a #21 ataca o CSS que bloqueia a pintura.
- Segurança: `npm audit --omit=dev` sem alertas; `JWT_SECRET` obrigatório em produção; `DEMO=1` desliga o upload no admin.

**Definição de pronto.** `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `npm run test:e2e` passam; CI verde no PR; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.** Itens 1 a 3 do backlog.

**Vira issue.** #21, #22, #23 (agente); #15 (agente, depois da #4); #4, #18, #19, #20 (responsável). A #4 e a #15 já existiam e foram completadas no modelo do processo.

## Ciclo de 07/11/2026

> Executado em 09/11/2026. Branch `feature/2026-11-07` → `developer/sprint-2026-11-12` → `main` (o PR para a `main` fica com o responsável). Nível: Vitrine (N2), 12 critérios.

### Produto

**Problema e público.** Sem mudança: loja fullstack de demonstração para recrutadores.

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| O guia de otimização do Bootstrap 5.3 recomenda importar por Sass só os componentes usados | `src/styles/bootstrap.scss` importa 19 módulos e deixa de fora 13 (modal, dropdown, carousel e outros) | [Bootstrap: Optimize](https://getbootstrap.com/docs/5.3/customize/optimize/) |
| A API de utilitários do Bootstrap é um mapa Sass (`$utilities`) que pode ser alterado antes de gerar as classes | Grupos sem uso removidos com `map-remove` e variantes responsivas só onde a loja usa | [Bootstrap: Utility API](https://getbootstrap.com/docs/5.3/utilities/api/), [Bootstrap: Sass](https://getbootstrap.com/docs/5.3/customize/sass/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Zerar o `npm audit` (#23) | Alto | Baixo | Este ciclo |
| 2 | CSS do Bootstrap reduzido (#21) | Médio | Baixo | Este ciclo |
| 3 | `MVP.md` com uma tabela só | Alto | Baixo | Este ciclo |
| 4 | LCP: atraso de renderização da imagem do destaque | Alto | Médio | #15 |
| 5 | `npm audit` no CI | Médio | Baixo | #26 |
| 6 | Compra como convidado | Médio | Médio | #22 |
| 7 | Publicar, proteger a `main`, meta, medição | Alto | Baixo | Responsável (#4, #18, #19, #20) |

**Fora do escopo.** Trocar o Bootstrap; pagamento real.

### Engenharia

**Arquitetura.** Sem mudança: React 19 + Vite + Bootstrap 5.3 (agora por Sass) + LESS no front; Express + Drizzle + SQLite na API; Render para publicar (não feito).

**Riscos.**
- Componente novo do Bootstrap precisa ser importado em `src/styles/bootstrap.scss`, ou fica sem estilo. O arquivo diz isso no topo.
- O Sass mostra avisos de depreciação do `@import` do Bootstrap 5.3; silenciados em `vite.config.ts` (`quietDeps` para as dependências e `silenceDeprecations` para os 4 tipos de aviso, que também aparecem no `bootstrap.scss` do projeto).
- Os overrides de `esbuild` (via `drizzle-kit`) e `minimatch` (via `typescript-eslint`) devem sair quando esses pacotes atualizarem.
- O LCP não melhorou com o CSS menor: o gargalo é o JavaScript e a API antes da imagem (#15).

**Qualidade.** `npm run lint`, `npm run typecheck`, `npm test` (4 + 10 testes, Vitest 4) e `npm run build` locais; `npx drizzle-kit generate` sem mudanças; `npm run db:seed` recria o banco; ponta a ponta no CI.

**Definição de pronto.** CI verde no PR para a sprint; `npm audit` sem alertas; `MVP.md` com uma tabela só; README atualizado.

### Plano de ação

**Este ciclo executa.** #21 e #23, e a reorganização do `MVP.md`.

**Vira issue.** #26 (`npm audit` no CI). O LCP segue na #15. Seguem com o responsável: #4, #18, #19, #20.
