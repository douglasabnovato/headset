# Plano estratégico — Headset Store

> Criado em 30/10/2026. Diagnóstico em `AVALIACAO.md`. Requisitos em `ESPECIFICACAO.md`.

## Objetivo

Chegar ao nível N2 (vitrine): demo no ar, CI ativo e documentação fiel.

## Arquitetura atual

React e Vite no front, Express com Drizzle e SQLite na API. Um único serviço entrega os dois na mesma origem, o que permite a sessão em cookie `httpOnly`.

## Execução

| Etapa | Entrega | Situação |
|---|---|---|
| 1 | CI ativo e dependências corrigidas | PR aberto |
| 2 | Avaliação e plano | Este PR |
| 3 | Confirmar a demo no Render | Ver `AVALIACAO.md` |
| 4 | Lint no CI | Próximo ciclo; hoje não há script de lint |
| 5 | Teste de ponta a ponta da compra | Próximo ciclo |

## O que você pode melhorar

- **Arquitetura:** o SQLite no plano gratuito perde os dados a cada novo deploy. Isso serve para demonstração, mas não para uma loja real.
- **Engenharia:** adicionar lint e proteger a `main`, porque o Render publica o que chega nela.
- **Produto:** dizer no início do README que se trata de uma demonstração, com o link e as decisões técnicas principais.
