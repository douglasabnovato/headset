# MVP — Headset Store

> Criado em 31/10/2026, com os critérios usados no `movies`. Situação baseada em `AVALIACAO.md` e na conferência deste ciclo.

## Problema e hipótese

**Problema e público:** Mostra a recrutadores uma loja fullstack completa em TypeScript, da vitrine ao pedido com transação e fila.

**Hipótese:** Quem avalia completa uma compra de demonstração em até 5 minutos pelo link publicado. Proposta inicial, para o responsável confirmar ou trocar. Sem medição, a meta ainda não pode ser conferida.

## 1. Critérios

| # | Critério | Como verificar | Situação em 31/10/2026 |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Parcial: meta proposta |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: fluxo coberto por testes locais; **não está no ar** (#4) |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: teste técnico adaptado, sem pagamento real |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica antes de publicar |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: catálogo, produto, pedidos e checkout têm carregamento, erro e vazio, conferidos no código |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não atende: 2,79 s em teste local (3,10, 2,79 e 2,26 s), depois de carregar a fonte só no `load`; antes, 3,39 s. Falta medir depois de publicar |
| 8 | Acessibilidade básica | Lighthouse e teclado | Atende no build atual: Lighthouse 100, axe no CI em 3 telas e compra iniciada só com teclado |
| 9 | Segurança e conformidade | Riscos decididos; termos de terceiros cumpridos | Parcial: alertas corrigidos; SQLite perde dados a cada deploy, aceitável em demonstração |
| 10 | Entrega confiável | Publicação só depois de CI verde | Parcial: `main` sem proteção; o Render publicaria o que chega na `main` |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 4 testes do front, 10 da API, compra de ponta a ponta e acessibilidade no CI |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto, e os números estão certos | Atende |

**Resultado:** 3 de 12 critérios atendidos por inteiro. É um julgamento técnico.

## 2. Tarefas

| # | Tarefa | Situação |
|---|---|---|
| 1 | Publicar no Render e conferir a demo | Com o responsável (#4) |
| 2 | Adicionar lint | Feito |
| 3 | Criar teste de ponta a ponta da compra | Feito |

## 3. Fora do MVP

Pagamento real, banco persistente e estoque real. A lista é uma proposta e pode mudar com a decisão do responsável.

## Medições de 02/11/2026

Build local: LCP de 3,39 s, acessibilidade 100. Lighthouse 12.8.2 local, perfil móvel simulado, sem aparelho real.
