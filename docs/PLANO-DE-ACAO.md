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
