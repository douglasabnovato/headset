# Avaliação — Headset Store

> Data: 30/10/2026 · Base: `main` · Complementa `ESPECIFICACAO.md`.

## Evidências

| Item | Resultado |
|---|---|
| Tipos, testes e build | Passam (4 testes do front e 10 da API) |
| CI | Não rodava: o arquivo estava em `docs/github-workflows/` |
| Dependências de produção | 5 alertas (3 altos, 2 moderados), corrigidos no PR do CI |
| Demo | `headset-store.onrender.com` responde 404: o serviço não existe nesse endereço |
| Lint | Não há script de lint |

**Não testado:** a aplicação em ambiente publicado, porque ela não está no ar.

## Achados

| # | Severidade | Achado | Encaminhamento |
|---|---|---|---|
| A1 | Alta | O README aponta para uma demo que não existe | README corrigido; publicar depende do responsável |
| A2 | Média | CI inativo | PR do CI |
| A3 | Média | Dependências com falhas de segurança | PR do CI |
| A4 | Baixa | Sem lint | Próximo ciclo |

## Nota

Nota anterior do portfólio: 5,0. **Nota atual: 6,0 com o PR do CI**; a demo no ar é o que falta para subir mais. É um julgamento técnico.
