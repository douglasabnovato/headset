# MVP — Headset Store

> Fonte única do estado. Tabela atual no topo; as anteriores estão em "Histórico", no fim. Testado no Windows com Node 24 e no CI com Node 22. Não houve teste com pessoas nem em aparelho real. Revisto em 18/11/2026, às 20h45: ciclo de 18/11 (#31, #32 e #36), sem mudar nenhuma situação; evidências dos critérios 7, 8 e 11 atualizadas.

**Nível:** Vitrine (N2), 12 critérios.

**Resumo:** 9 de 12 aplicáveis atendidos (1, 2, 4, 6, 8, 9, 10, 11 e 12).

**Finalizado:** sim

O que o código resolve está feito. Os três critérios abertos dependem do responsável, cada um com issue `depende-do-responsavel`: 3 e 7 esperam a publicação no Render (#4, com a medição na #15); 5 espera a conta do GoatCounter (#20). O critério 9 voltou a "Atende" em 16/11/2026, depois que o responsável ligou os alertas do Dependabot (#35): 0 alertas abertos e audit de produção 0.

## Produto

- **Problema:** recrutadores precisam ver uma loja fullstack completa em TypeScript, da vitrine ao pedido com transação e fila.
- **Público:** recrutadores e quem avalia o portfólio.
- **Hipótese:** acreditamos que quem avalia o portfólio completa uma compra de demonstração em até 5 minutos pelo link publicado. Saberemos quando, nas 4 primeiras semanas com o site no ar, o GoatCounter mostrar pelo menos 1 `compra-concluida` para cada 5 visitas à vitrine, e uma sessão observada terminar a compra em até 5 minutos.
- **Métrica:** eventos `compra-concluida` por visitas à vitrine, medido por GoatCounter, e tempo da compra numa sessão observada — meta: 1 para cada 5 visitas nas 4 primeiras semanas no ar, e compra em até 5 minutos. Meta decidida pelo coordenador em 10/11/2026 (D1) e proporção escrita em 16/11/2026, ambas revisáveis pelo responsável (#19). Depende da publicação (#4) e da conta (#20).

## Critérios em 18/11/2026 (ciclo de 18/11/2026: `feature/2026-11-18` → `developer/sprint-2026-11-19`)

| # | Critério | Situação | Evidência (comando, data, resultado) ou o que falta | Issue |
|---|---|---|---|---|
| 1 | Problema e público claros | Atende | Uma frase, em "Problema e hipótese" abaixo | — |
| 2 | Hipótese a validar | Atende | Aposta com meta e "saberemos quando", em "Problema e hipótese". Meta decidida pelo coordenador em 10/11/2026 (decisão D1), revisável pelo responsável | #19 |
| 3 | Fluxo principal completo | Parcial | Compra de ponta a ponta no navegador: `e2e/compra.spec.ts` (`npx playwright test`, 16/11/2026: passa). Não está no ar: `curl -s -m 60 -o /dev/null -w "%{http_code}" https://headset-store.onrender.com/api/health`, 16/11/2026: 404, com `x-render-routing: no-server` (não há serviço com esse nome) | #4 |
| 4 | Escopo enxuto | Atende | Seção "Fora do MVP" abaixo | — |
| 5 | Medição de uso | Parcial | Código pronto: GoatCounter sem cookie só no build de produção, com o evento `compra-concluida` (`src/lib/medicao.test.ts`, `npx vitest run`, 16/11/2026: passa). Falta a conta e o site no ar | #20, #4 |
| 6 | Falhas tratadas | Atende | `e2e/falhas.spec.ts`, novo: carregamento com a API lenta, falha de rede com "Tentar de novo" e catálogo vazio na vitrine (`npx playwright test`, 16/11/2026: 3 de 3; CI do PR #37, [run 43818703076](https://github.com/douglasabnovato/headset/actions/runs/43818703076): sucesso). Checkout com CEP fora do ar coberto pela compra (`e2e/compra.spec.ts`) | — |
| 7 | Desempenho aceitável | Parcial | Só a medição local existe. Lighthouse 12.8.2 móvel no build local (`vite preview`, sem compressão), 18/11/2026: vitrine com LCP de 2,05, 2,03 e 2,06 s (mediana 2,05 s; TBT de 29 a 57 ms; elemento `main.container > section.destaque > div.destaque__imagem > img`, a imagem do esqueleto); produto com CLS 0,000 nas 3 (antes 0,26, #32); vitrine filtrada `/?q=gamer` com CLS de 0,005 a 0,006 (LCP de 2,92 a 3,49 s, imagem de um card). A imagem do destaque não é mais baixada fora da vitrine (#31, `e2e/desempenho.spec.ts`). No N2 só vale o site publicado, que não existe | #15, #4 |
| 8 | Acessibilidade básica | Atende | `e2e/acessibilidade.spec.ts`: axe com as regras WCAG 2.0/2.1 A e AA, **sem nenhuma violação** (antes só as sérias), nos temas claro e escuro (o app tem tema escuro de verdade: `data-bs-theme` a partir de `prefers-color-scheme`, conferido no teste), 1280 × 800, dados do seed, em `/`, `/carrinho`, `/entrar`, `/produto/<slug>`, carrinho com item e checkout; adição ao carrinho só com Tab e Enter, com foco visível comparado ao botão sem foco (`npx playwright test`, 16/11/2026: 11 de 11; CI do PR #37, [run 43818703076](https://github.com/douglasabnovato/headset/actions/runs/43818703076): sucesso). Telas logadas (#36), em `e2e/acessibilidade-logado.spec.ts`: axe sem violações em `/pedidos` e `/pedidos/<id>` depois de uma compra e em `/admin/produtos` e `/admin/relatorios`, nos dois temas; no modal do admin, Esc fecha e o foco volta, visível, ao botão que o abriu, só com o teclado (`npx playwright test`, 18/11/2026: 5 de 5). O axe achou `definition-list` no resumo do carrinho, corrigido (`src/components/Resumo.test.tsx`) | #36 |
| 9 | Segurança e conformidade | Atende | `gh api "repos/douglasabnovato/headset/dependabot/alerts?state=open&per_page=100"`, 16/11/2026 12h00: 0 alertas abertos (alertas ligados pelo responsável nesse dia, #35). `npm audit --omit=dev` depois do `npm ci`, 16/11/2026 12h28: 0 vulnerabilidades na raiz e em `server`. O CI roda o audit (#26; [run 43818703076](https://github.com/douglasabnovato/headset/actions/runs/43818703076): 0 vulnerabilidades). Sem segredo no código (`JWT_SECRET` gerado pelo Render). SQLite volta aos dados de exemplo a cada deploy, aceito em demonstração | #35 |
| 10 | Entrega confiável | Atende | `gh api repos/douglasabnovato/headset/rules/branches/main`, 16/11/2026: `deletion`, `non_fast_forward`, `pull_request` e `required_status_checks` (`verificar`). O workflow `CI` roda nos PRs para `main` e `developer/**`; último CI da `main` (run 43799488509, 16/11/2026): sucesso | #18 |
| 11 | Testes dos fluxos críticos | Atende | `npm test`, 18/11/2026: 18 testes do front (5 arquivos) e 13 da API. `npx playwright test`, 18/11/2026: 26 de ponta a ponta (compra, 3 de falha, 10 de axe nas telas abertas, 4 de axe nas logadas, 2 de teclado e 6 de desempenho). Antes, 16/11/2026: No CI do PR #37 ([run 43818703076](https://github.com/douglasabnovato/headset/actions/runs/43818703076), job `verificar`, 16/11/2026): 17 + 13 + 15 passed, sem `skip` | — |
| 12 | Documentação honesta | Atende | Uma tabela só; resumo batendo com ela (9 "Atende", conferido em 17/11/2026); README com estado e próximos passos, comandos conferidos contra o `package.json` em 16/11/2026 | — |

## Problema e hipótese

**Problema e público:** mostra a recrutadores uma loja fullstack completa em TypeScript, da vitrine ao pedido com transação e fila.

**Hipótese:** acreditamos que quem avalia o portfólio completa uma compra de demonstração em até 5 minutos pelo link publicado. Saberemos quando, nas 4 primeiras semanas com o site no ar, o painel do GoatCounter mostrar pelo menos 1 evento `compra-concluida` para cada 5 visitas à vitrine, e uma sessão observada com uma pessoa terminar a compra em até 5 minutos. Meta decidida pelo coordenador em 10/11/2026 (decisão D1), revisável pelo responsável (#19); a proporção de 1 para 5 foi escrita em 16/11/2026 e também é revisável. Medir depende da publicação (#4) e da conta (#20).

## Fora do MVP

Pagamento real, banco persistente e estoque real. A lista é uma proposta e pode mudar com a decisão do responsável.

## Histórico

- 20/11/2026: bloco Produto padronizado, sem mudar critérios.
- 18/11/2026: ciclo das issues #31, #32 e #36, sem mudar nenhuma situação. CLS do produto de 0,26 para 0 e imagem do destaque só na vitrine; axe nas telas logadas e Esc no modal do admin. Testes de 15 para 26 de ponta a ponta.
- 17/11/2026: limpeza, sem reavaliar critério. As tabelas antigas do Histórico viraram as linhas abaixo, para o arquivo ter uma tabela de critérios só, um resumo e um finalizado. A evidência do critério 12 dizia "8 Atende"; a tabela tem 9, e o texto foi corrigido.
- 16/11/2026, 12h28: critério 9 de "Parcial" para "Atende". Antes, a API de alertas do Dependabot respondia 403 (alertas desligados, engenharia#33). Com os alertas ligados, 0 abertos e audit de produção 0. Resumo de 8 para 9 de 12. No mesmo ciclo, o critério 8 passou a usar o axe completo (WCAG A e AA) nos temas claro e escuro, e o 6 ganhou `e2e/falhas.spec.ts`.
- 10/11/2026 (ciclo da faixa de 90%): 9 de 12 declarados, finalizado sim. Mudou: hipótese com meta decidida pelo coordenador (D1, #19), `main` protegida (#18), `/api/health` consultando o banco, GoatCounter pronto no código (#20) e LCP local de 2,07 s com o esqueleto no HTML (PR #30). Revista em 16/11/2026: o 9 só tinha o `npm audit`, com os alertas desligados, e o 11 tinha números de testes antigos.
- 09/11/2026 (ciclo de 09/11/2026): 8 de 12, finalizado sim. Diferia por 2 Parcial (meta sem confirmação), 3 Parcial (`/api/health` sem banco) e 5 Não atende.
- 09/11/2026 (ciclo de 07/11/2026): 7 de 12, finalizado não. 7 Não atende (LCP local mediano de 3,44 s, com atraso de renderização) e 10 Parcial (`main` sem proteção). O CSS do Bootstrap caiu de 240,69 KB para 136,42 KB (#21), sem resolver o LCP.
- 06/11/2026 (ciclo de 03/11/2026): 6 de 12, finalizado não; antes do ciclo, 5 de 12. O resumo dizia "3 de 12" com 6 "Atende" e foi corrigido. 7 Não atende (2,79 s local em 02/11) e 9 Parcial (alertas de desenvolvimento no Vitest 3 e no `drizzle-kit`, #23). Tarefas do ciclo: lint, teste de ponta a ponta da compra e Playwright 1.65 com CI nas `developer/**` feitos; publicação com o responsável (#4); Bootstrap (#21) e compra como convidado (#22) viraram issues.
- 02/11/2026: build local com LCP de 3,39 s e depois 2,79 s (fonte só no `load`), acessibilidade 100 (Lighthouse 12.8.2, móvel simulado, sem aparelho real). Em 06/11/2026, `https://headset-store.onrender.com` respondeu 404, sem medição no ar.
