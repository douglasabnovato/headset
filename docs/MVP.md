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
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Parcial: checkout tratado, segundo o README; demais telas não revistas |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não medido neste ciclo |
| 8 | Acessibilidade básica | Lighthouse e teclado | Parcial: axe citado na documentação; não repetido neste ciclo |
| 9 | Segurança e conformidade | Riscos decididos; termos de terceiros cumpridos | Parcial: alertas corrigidos; SQLite perde dados a cada deploy, aceitável em demonstração |
| 10 | Entrega confiável | Publicação só depois de CI verde | Parcial: `main` sem proteção; o Render publicaria o que chega na `main` |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Parcial: 4 testes do front e 10 da API; sem ponta a ponta |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto, e os números estão certos | Atende |

**Resultado:** 3 de 12 critérios atendidos por inteiro. É um julgamento técnico.

## 2. Tarefas

| # | Tarefa | Situação |
|---|---|---|
| 1 | Publicar no Render e conferir a demo | Com o responsável (#4) |
| 2 | Adicionar lint | Próximo ciclo |
| 3 | Criar teste de ponta a ponta da compra | Próximo ciclo |

## 3. Fora do MVP

Pagamento real, banco persistente e estoque real. A lista é uma proposta e pode mudar com a decisão do responsável.
