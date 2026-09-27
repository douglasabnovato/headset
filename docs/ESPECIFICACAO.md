# Especificação · Headset Store

> Documento de requisitos do e-commerce de headphones. Adapta o teste técnico Full Stack
> (originalmente Laravel + Vue.js, loja de camisetas) para uma loja de fones de ouvido
> construída 100% em TypeScript: React + Vite no front e Node.js + Express + Drizzle ORM + SQLite na API.

## 1. Visão do produto

| Item | Definição |
|---|---|
| Problema | Quem compra fone on-line precisa comparar tipo (over-ear, in-ear, gamer), conexão e preço, e confiar que o valor do carrinho é o valor cobrado. |
| Proposta | Catálogo filtrável de headphones, carrinho e lista de desejos persistentes, checkout validado com CEP automático e histórico de pedidos. |
| Personas | **Cliente** (compra e acompanha pedidos) e **Admin** (mantém o catálogo e acompanha vendas). |
| Métrica de sucesso | Pedido concluído sem erro de validação e com preço recalculado no servidor. |

## 2. Mapa do teste original → este projeto

| Nº | Exercício original | Onde está aqui |
|---|---|---|
| 1 | Ciclo de vida de componente Vue | `docs/exercicios/01-ciclo-de-vida.md` (equivalente em React, com exemplos do projeto) |
| 2 | Autenticação Laravel + Vue | Implementado: JWT em cookie `httpOnly` · `docs/exercicios/02-autenticacao.md` |
| 3 | Endpoint lento | Cache + índices + log de tempo por rota · `docs/exercicios/03-endpoint-lento.md` |
| 4 | CDN | `docs/exercicios/04-cdn.md` |
| 5 | Memcached / ElastiCache | Cache em memória com TTL e invalidação (`server/src/lib/cache.ts`) · `docs/exercicios/05-cache.md` |
| 6 | Eloquent e N+1 | Drizzle com `with` (eager loading) · `docs/exercicios/06-orm-n-mais-1.md` |
| 7 | Filas assíncronas | Fila em processo com tentativas (`server/src/lib/queue.ts`) · `docs/exercicios/07-filas.md` |
| 8 | Transactions | Criação de pedido + baixa de estoque em transação · `docs/exercicios/08-transactions.md` |
| 9 | Leitura de log | `docs/exercicios/09-log.md` |
| 10 | CRUD Laravel + Vue com auth | CRUD de produtos (nome, descrição, preço, imagem) só para admin |
| 11 | Crítica de código (transformer) | `docs/exercicios/11-critica-transformer.md` + `server/src/transformers/orderItem.ts` |
| 12 | Página de finalização de compra | `/checkout` com todas as validações, CEP via `cep-promise`, loaders, sucesso e `console.log` |
| 13 | Experiência profissional | `docs/exercicios/13-experiencia.md` (roteiro para você preencher) |
| 14 | SQL/Eloquent de vendas | `docs/sql/14-vendas.sql` + relatório no painel admin |
| 15 | SQL de produtos/fornecedores/estoque | `docs/sql/15-estoque.sql` |

## 3. Requisitos funcionais

### RF01 · Catálogo
- Listar headphones ativos com imagem, nome, tipo, conexão, preço e selo de frete grátis.
- Buscar por texto; filtrar por **tipo** (over-ear, on-ear, in-ear, gamer) e **conexão** (Bluetooth, cabo, 2.4 GHz); ordenar por relevância, menor e maior preço.
- Paginação de 12 itens; estado vazio com ação "Limpar filtros".
- Critério de aceite: filtros refletem na URL (link compartilhável) e o total de resultados é anunciado para leitores de tela.

### RF02 · Página do produto
- Galeria, descrição, preço de/por, estoque ("Últimas unidades" abaixo de 5, "Esgotado" em 0).
- Seletor de quantidade limitado ao estoque; botões "Adicionar ao carrinho" e "Lista de desejos".
- Produto inexistente ou inativo → página 404 amigável.

### RF03 · Carrinho
- Adicionar, alterar quantidade (1 até o estoque), remover e esvaziar; persiste no navegador.
- Ao abrir, os itens são **cotados na API** (`POST /api/cart/quote`): preço e estoque atuais; itens indisponíveis são sinalizados.
- Frete: grátis a partir de R$ 299,00; abaixo disso R$ 19,90.

### RF04 · Lista de desejos
- Favoritar/desfavoritar no card e na página do produto; página dedicada com "Mover para o carrinho".

### RF05 · Autenticação
- Cadastro (nome, e-mail único, senha ≥ 8 com letra e número), login, logout e sessão atual.
- Sessão em cookie `httpOnly` com JWT (2 h); senhas com bcrypt; limite de tentativas de login.
- Papéis: `customer` e `admin`.

### RF06 · Checkout (exercício 12)
- Exige login; carrinho vazio mostra estado vazio.
- Campos obrigatórios: nome completo, e-mail, telefone, CEP, rua, número, bairro, cidade, UF, número do cartão, nome no cartão, validade, CVV.
- Formatos: e-mail, telefone com DDD, CEP de 8 dígitos, cartão com algoritmo de Luhn (13–19 dígitos), validade MM/AA não vencida, CVV de 3 ou 4 dígitos.
- CEP preenche endereço com `cep-promise`, com indicador de carregamento e fallback manual em caso de falha.
- Alteração de quantidade na própria página; resumo recalculado.
- Sucesso: mensagem com número do pedido e `console.log` do objeto final enviado.

### RF07 · Pedidos
- Criação transacional: valida estoque, recalcula preços no servidor, grava pedido e itens e baixa o estoque; se algo falhar, nada é gravado.
- Nunca armazena o número completo do cartão (apenas os 4 últimos dígitos).
- E-mail de confirmação enviado por fila assíncrona (simulado em log).

### RF08 · Histórico de compras
- `/pedidos`: lista do cliente com data, status, quantidade de itens e total; detalhe com itens, endereço e pagamento mascarado.
- Botão "Comprar de novo" recoloca os itens no carrinho.

### RF09 · Administração (exercício 10)
- CRUD de produtos: nome, descrição, preço, imagem (upload PNG/JPG/WebP até 2 MB **ou** URL), tipo, conexão, cor, estoque, ativo.
- Somente `admin` pode criar, editar e excluir; leitura é pública.
- Relatórios (exercício 14): vendas por estado e 5 clientes que mais compraram.

## 4. Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | TypeScript estrito no front e na API. |
| RNF02 | Acessibilidade: HTML semântico, `label` em todos os campos, foco visível, `aria-live` para status e erros, contraste AA, navegação por teclado, "pular para o conteúdo". |
| RNF03 | Bootstrap 5.3 personalizado com **LESS** (tokens de cor, tipografia, raio, botões e temas claro/escuro). |
| RNF04 | Performance: rotas com carregamento sob demanda, imagens com dimensões e `loading="lazy"`, cache de listagem na API com invalidação, índices no banco. |
| RNF05 | Segurança: `helmet`, cookie `httpOnly`/`SameSite=Lax`, validação com `zod` em toda entrada, upload com tipo e tamanho restritos, preço sempre calculado no servidor. |
| RNF06 | Testes automatizados: API (auth, permissões, CRUD, pedido/estoque) e validadores do checkout. |
| RNF07 | Rodar com `npm install` e `npm run dev`, sem Docker; banco SQLite criado e populado automaticamente (dados de exemplo com `@faker-js/faker`). |
| RNF08 | Documentação: README com instruções e justificativas; exercícios identificados em `docs/`. |

## 5. Arquitetura

```
headset/
├── index.html · vite.config.ts · src/        # Front (React 18 + Vite + TS)
│   ├── api/ context/ hooks/ lib/ components/ pages/ styles/
├── server/                                   # API (Express + Drizzle + SQLite)
│   ├── src/ db/ routes/ middleware/ lib/ transformers/
│   └── tests/
├── static/                                   # Arquivos públicos do front (imagens, favicon)
└── docs/                                     # Especificação, exercícios e SQL
```

- **Front**: React Router com rotas lazy; contextos de Auth, Carrinho e Desejos; `fetch` centralizado em `src/api/client.ts` com cookies (`credentials: 'include'`); proxy do Vite para `/api` (mesma origem no desenvolvimento).
- **API**: `createApp()` separado do `listen` para testes; rotas por recurso; erros centralizados em JSON `{ error, details }`.
- **Banco**: SQLite via `better-sqlite3` + Drizzle ORM (tipos inferidos do schema). Trocar para MySQL/Postgres = trocar o driver do Drizzle.

## 6. Modelo de dados

| Tabela | Campos principais |
|---|---|
| `users` | id, name, email (único), password_hash, role, state (UF), created_at |
| `products` | id, name, slug (único), description, price_cents, compare_at_cents, image_url, type, connection, color, stock, active, created_at, updated_at |
| `orders` | id, user_id → users, status, subtotal_cents, shipping_cents, total_cents, dados do cliente e endereço, card_last4, created_at |
| `order_items` | id, order_id → orders, product_id → products, product_name (snapshot), unit_price_cents, quantity, total_cents |

Valores monetários em **centavos inteiros** (evita erro de ponto flutuante). Índices em `products(type, connection, active)`, `orders(user_id, created_at)` e `order_items(order_id)`.

## 7. API REST

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | público | Cria conta e inicia sessão |
| POST | `/api/auth/login` | público (limitado) | Inicia sessão |
| POST | `/api/auth/logout` | público | Encerra sessão |
| GET | `/api/auth/me` | autenticado | Usuário atual |
| GET | `/api/products` | público | Lista com `q, type, connection, sort, page` |
| GET | `/api/products/:slug` | público | Detalhe |
| POST | `/api/products` | admin | Cria (multipart ou JSON) |
| PUT | `/api/products/:id` | admin | Atualiza |
| DELETE | `/api/products/:id` | admin | Exclui (ou inativa se já foi vendido) |
| POST | `/api/cart/quote` | público | Preço e estoque atuais dos itens |
| POST | `/api/orders` | autenticado | Cria pedido (transação) |
| GET | `/api/orders` | autenticado | Histórico do usuário |
| GET | `/api/orders/:id` | dono ou admin | Detalhe |
| GET | `/api/reports/sales-by-state` | admin | Exercício 14a |
| GET | `/api/reports/top-customers` | admin | Exercício 14b |

## 8. Telas

| Rota | Tela |
|---|---|
| `/` | Catálogo com destaque (card original do projeto Headset) |
| `/produto/:slug` | Produto |
| `/carrinho` | Carrinho |
| `/desejos` | Lista de desejos |
| `/checkout` | Finalização (ex. 12) |
| `/entrar` · `/cadastro` | Autenticação |
| `/pedidos` · `/pedidos/:id` | Histórico |
| `/admin/produtos` · `/admin/produtos/novo` · `/admin/produtos/:id` | CRUD |
| `/admin/relatorios` | Relatórios |

## 9. Plano de execução

1. Especificação (este documento).
2. API: schema, migração, seed com faker, auth, produtos, carrinho, pedidos, relatórios, cache, fila, testes.
3. Front: base Vite + Bootstrap/LESS + temas, catálogo, produto, carrinho, desejos, auth, checkout, pedidos, admin.
4. Documentação dos exercícios e SQL.
5. Verificação: testes, build, fluxo completo no navegador, README.
