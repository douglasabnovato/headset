# MVP — Headset Store

> Fonte única do estado. Tabela atual no topo; as anteriores estão em "Histórico", no fim. Testado no Windows com Node 24 e no CI com Node 22. Não houve teste com pessoas nem em aparelho real.

**Nível:** Vitrine (N2), 12 critérios.

**Resumo:** 7 de 12 aplicáveis atendidos (1, 4, 6, 8, 9, 11 e 12).

**Finalizado:** não. Falta o critério 7 (LCP), que o código resolve (#15). Os critérios 2 (#19), 3 (#4), 5 (#20) e 10 (#18) dependem do responsável.

## Critérios em 09/11/2026 (ciclo de 07/11/2026)

| # | Critério | Situação | Evidência (comando, data, resultado) ou o que falta | Issue |
|---|---|---|---|---|
| 1 | Problema e público claros | Atende | Uma frase, em "Problema e hipótese" abaixo | — |
| 2 | Hipótese a validar | Parcial | Meta proposta (compra de demonstração em até 5 minutos), sem confirmação | #19 |
| 3 | Fluxo principal completo | Parcial | Compra coberta pelo teste de ponta a ponta. Não está no ar: `curl https://headset-store.onrender.com` deu 404 em 09/11/2026 | #4 |
| 4 | Escopo enxuto | Atende | Teste técnico adaptado, sem pagamento real ("Fora do MVP") | — |
| 5 | Medição de uso | Não atende | Sem site e sem ferramenta | #4, #20 |
| 6 | Falhas tratadas | Atende | Catálogo, produto, pedidos e checkout com carregamento, erro e vazio; compra de ponta a ponta no CI | — |
| 7 | Desempenho aceitável | Não atende | Lighthouse 12.8.2 local, móvel simulado, build de produção, 09/11/2026. Com o Bootstrap inteiro: LCP 3,67 / 3,68 / 3,47 s. Com o Bootstrap reduzido: 3,44 / 3,39 / 3,37 s e, numa segunda série, 3,62 / 3,25 / 3,54 s (mediana 3,44 s). O elemento do LCP é a imagem do destaque, e 80% do tempo é atraso de renderização: o JavaScript e a chamada à API vêm antes. Reduzir o CSS não resolveu | #15 |
| 8 | Acessibilidade básica | Atende | Lighthouse acessibilidade 100 nas 6 execuções de 09/11/2026; axe sem violação séria em 3 telas e compra iniciada só com teclado (Playwright no CI) | — |
| 9 | Segurança e conformidade | Atende | `npm audit` (todas as dependências, inclusive desenvolvimento), 09/11/2026: "found 0 vulnerabilities". SQLite perde dados a cada deploy, aceito em demonstração | #26 |
| 10 | Entrega confiável | Parcial | CI verde nos PRs, também para `developer/**`; a `main` segue sem proteção | #18 |
| 11 | Testes dos fluxos críticos | Atende | `npm test`, 09/11/2026: 4 testes do front e 10 da API passam (Vitest 4). 5 de ponta a ponta no CI | — |
| 12 | Documentação honesta | Atende | Uma tabela só, resumo batendo com ela; README com estado e próximos passos | — |

**CSS do Bootstrap (#21), `npx vite build`, 09/11/2026:** de 240,69 KB (gzip 33,63 KB) para 136,06 KB (gzip 22,00 KB): -43% sem gzip e -35% com gzip. Conferido que as 155 classes do Bootstrap citadas no código seguem no CSS novo, e telas de vitrine, carrinho e checkout vistas nos temas claro e escuro.

## Problema e hipótese

**Problema e público:** mostra a recrutadores uma loja fullstack completa em TypeScript, da vitrine ao pedido com transação e fila.

**Hipótese:** quem avalia completa uma compra de demonstração em até 5 minutos pelo link publicado. Meta proposta pelo agente; confirmar é do responsável (#19). Medir depende da publicação (#4) e de uma ferramenta (#20).

## Fora do MVP

Pagamento real, banco persistente e estoque real. A lista é uma proposta e pode mudar com a decisão do responsável.

## Histórico

### Revisão de 06/11/2026 (ciclo de 03/11/2026): 6 de 12 atendidos

Antes deste ciclo: 5 de 12. O resumo dizia "3 de 12" com 6 "Atende" na tabela, então o critério 12 era "Parcial".

| # | Critério | Como verificar | Situação em 06/11/2026 |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Parcial: meta proposta, sem confirmação (#19) |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: compra coberta pelo teste de ponta a ponta; **não está no ar** (404 em 06/11, #4) |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: teste técnico adaptado, sem pagamento real (seção 3) |
| 5 | Medição de uso | A métrica principal é coletada | Não atende: sem site e sem ferramenta (#4, #20) |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: catálogo, produto, pedidos e checkout têm carregamento, erro e vazio; a compra de ponta a ponta passa no CI |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não atende: 2,79 s em teste local de 02/11 (3,10, 2,79 e 2,26 s). Sem site publicado, não houve medição em 06/11 (#15). O CSS inteiro do Bootstrap bloqueia a primeira pintura (#21) |
| 8 | Acessibilidade básica | Lighthouse e teclado | Atende: Lighthouse 100 em 02/11; axe sem violação séria em 3 telas e compra iniciada só com teclado, no CI (5 testes Playwright passando em 06/11) |
| 9 | Segurança e conformidade | Riscos decididos; termos de terceiros cumpridos | Parcial: `npm audit --omit=dev` sem alertas; restam alertas moderados de desenvolvimento no Vitest 3 e no `drizzle-kit` (#23). SQLite perde dados a cada deploy, aceitável em demonstração |
| 10 | Entrega confiável | Publicação só depois de CI verde | Parcial: CI verde nos PRs, agora também para `developer/**`; a `main` segue sem proteção (#18) |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 4 testes do front, 10 da API e 5 de ponta a ponta (compra e acessibilidade) no CI |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto, e os números estão certos | Atende: resumo corrigido em 06/11; README com estado e próximos passos |

**Finalizado: não.** Faltam os critérios 7 (#21, e a medição da #15) e 9 (#23), que o código resolve. Os critérios 2 (#19), 3 (#4), 5 (#20) e 10 (#18) dependem do responsável.

Tarefas em 06/11/2026:

| # | Tarefa | Situação |
|---|---|---|
| 1 | Publicar no Render e conferir a demo | Com o responsável (#4) |
| 2 | Adicionar lint | Feito |
| 3 | Criar teste de ponta a ponta da compra | Feito |
| 4 | Playwright 1.65 e CI nas `developer/**` | Feito em 06/11 |
| 5 | Reduzir o CSS do Bootstrap | Issue #21 |
| 6 | Compra como convidado | Issue #22 |

### Medições anteriores

- **02/11/2026:** build local, LCP de 3,39 s e depois 2,79 s (fonte só no `load`), acessibilidade 100. Lighthouse 12.8.2 local, perfil móvel simulado, sem aparelho real.
- **06/11/2026:** `https://headset-store.onrender.com` respondeu 404. Sem site publicado, o LCP no ar não foi medido.
