# Exercício 2 · Autenticação entre frontend e backend

> Original: Laravel + Vue. Aqui: Express + React, com o mesmo desenho que o Laravel Sanctum usa para SPA.

## Abordagem recomendada
Para uma SPA servida no **mesmo domínio** (ou subdomínio) da API, a melhor opção é **sessão em cookie `httpOnly`**, não token no `localStorage`:

| | Cookie httpOnly (escolhido) | Token no localStorage |
|---|---|---|
| Roubo por XSS | o JavaScript não lê o cookie | qualquer script injetado lê o token |
| CSRF | mitigado com `SameSite=Lax` + API só aceitando JSON/multipart (em Laravel: `Sanctum` + `XSRF-TOKEN`) | não se aplica |
| Expiração/revogação | controlada pelo servidor | depende de listas de bloqueio |

No Laravel isso é o **Sanctum no modo SPA** (`/sanctum/csrf-cookie` → `POST /login` → sessão). Tokens Bearer (Sanctum tokens/Passport) ficam para apps mobile e integrações de terceiros.

## Fluxo implementado
1. `POST /api/auth/login` com e-mail e senha → validação com `zod` → `bcrypt.compare` (limite de 10 tentativas/15 min por IP).
2. A API assina um JWT curto (2 h) com `id`, `role`, `name` e grava em cookie `httpOnly; SameSite=Lax; Secure` (em produção).
3. O front **nunca** vê o token: chama `GET /api/auth/me` para saber quem está logado (`AuthContext`).
4. Toda requisição usa `credentials: "include"`; o middleware `lerSessao` valida o JWT e preenche `req.user`.
5. Autorização por rota: `exigirLogin` (pedidos) e `exigirAdmin` (CRUD e relatórios). O front esconde botões, mas **quem garante é a API** (testado: cliente recebe 403).
6. `POST /api/auth/logout` apaga o cookie.

## Boas práticas
- HTTPS obrigatório em produção; `JWT_SECRET` forte fora do repositório (`.env`).
- Mensagem genérica "e-mail ou senha incorretos" (não revela se o e-mail existe).
- Senhas com bcrypt (custo 10) e regra mínima (8 caracteres, letra e número).
- Para sessões longas: *refresh token* rotativo também em cookie `httpOnly`, com revogação no banco.
