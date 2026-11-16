# Deploy · Headset Store

Plano de ação para publicar a loja em hospedagem gratuita.

## 1. Desafio

Colocar no ar, sem custo, uma aplicação fullstack (React + Express + SQLite) que usa **sessão em cookie `httpOnly`** e **área de admin com upload**, sem abrir brechas de segurança numa demonstração pública.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, 1 serviço web gratuito (escolhida)** | API e front na mesma origem: o cookie `SameSite=Lax` funciona sem CORS |
| Front na Vercel/Netlify + API no Render | Domínios diferentes quebram o login por cookie; o proxy da Netlify expira em 26 s e o Render leva ~1 min para acordar |
| VPS | Fora da regra do portfólio (só hospedagem gratuita) |

### O que foi ajustado no código para produção

| Mudança | Arquivo | Por quê |
|---|---|---|
| A API entrega o `dist/` e devolve `index.html` nas rotas do React | `server/src/lib/front.ts`, `server/src/app.ts` | Um único serviço, mesma origem |
| CSP explícita (hash do script inline do tema, Google Fonts, serviços de CEP) | `server/src/app.ts` | Sem ela, o `helmet` bloquearia o tema e o CEP |
| `trust proxy` em produção | `server/src/app.ts` | Sem isso, o limite de login contaria todos os visitantes como um só IP |
| `DEMO=1` desliga upload e aceita só imagens do catálogo | `server/src/config.ts`, `server/src/routes/products.ts` | A senha do admin é pública no README |
| `server/.env` passa a ser lido; `DATABASE_URL=` vazio usa o padrão | `server/src/config.ts` | Antes o `.env` era ignorado e o valor vazio criava um banco temporário |
| Aviso "não informe dados reais" no rodapé | `src/components/Footer.tsx` | O checkout pede nome, telefone e endereço (LGPD) |
| Script `start:prod` e `engines` | `package.json` | Comando de início no Render |
| CI (tipos, testes, build) | `.github/workflows/ci.yml` | Garantia a cada push |
| Blueprint do Render | `render.yaml` | Infraestrutura como código |

### Limitações conhecidas do plano gratuito

- O serviço dorme após 15 min sem acesso e leva cerca de 1 min para acordar.
- O disco é temporário: a cada reinício o banco volta aos dados de exemplo (o seed roda sozinho).
- As 750 horas gratuitas por mês são da conta inteira do Render, somando todos os serviços.

## 3. Solução (passo a passo)

### Etapa 1 · Validar localmente (Git Bash)

1. `git clone https://github.com/douglasabnovato/headset.git && cd headset`
2. `npm ci`
3. `npm run lint && npm run typecheck && npm test && npm run build` (esperado em 16/11/2026: 17 testes do front e 13 da API passando)
4. `npx playwright install chromium && npm run test:e2e` (esperado: 15 testes passando). Se as portas 3333 ou 4173 estiverem ocupadas: `E2E_API_PORT=3473 E2E_WEB_PORT=4473 npm run test:e2e`.

### Etapa 2 · Subir para o GitHub

1. `git status` (não podem aparecer `server/data/`, `dist/` nem `.env`)
2. `git add -A`
3. `git commit -m "feat(deploy): API serve o front em produção, CSP, trust proxy, modo demo, CI e blueprint do Render"`
4. `git push`
5. No GitHub, aba **Actions**: o CI precisa ficar verde.

### Etapa 3 · Criar o serviço no Render

0. Antes, conferir que o nome está livre: `curl -sI https://headset-store.onrender.com/ | grep -i x-render`. Em 16/11/2026 respondeu `x-render-routing: no-server` (nenhum serviço com esse nome). Se aparecer `x-render-origin-server`, o nome é de outra conta, e o Render vai dar outro endereço.
1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `headset`.
2. **New → Blueprint** e escolher `douglasabnovato/headset`.
3. Conferir o serviço `headset-store`, plano **Free**, e clicar em **Apply**.
4. Acompanhar **Logs** até aparecer `API do Headset Store em http://localhost:10000` (3 a 6 min).

### Etapa 4 · Conferir no ar

1. `curl https://<endereço>/api/health` responde 200 com `"ok":true`, `"demo":true` e `"banco":"ok"` (a rota consulta o banco; sem banco, responde 503).
2. A vitrine mostra os produtos; F5 em `/produto/...` continua funcionando.
3. Login como cliente (`cliente@headset.dev` / `Cliente@123`) e **Pedidos** mostra o histórico.
4. No checkout, o CEP preenche o endereço.
5. Como admin, enviar imagem mostra o aviso de demonstração.
6. O tema escuro continua salvo ao recarregar.

### Etapa 5 · Fechar

1. Se a URL real for diferente de `https://headset-store.onrender.com`, corrigir no `README.md`, commit e push (o Render publica sozinho).
2. No GitHub, **About → Website**: colar a URL.
3. Comentar na #4 o endereço real. O agente do próximo ciclo mede o LCP no site (`npx lighthouse@12.8.2 https://<endereço>/ --only-categories=performance --form-factor=mobile --chrome-flags="--headless --no-sandbox"`, 3 execuções, mediana, TBT e elemento do LCP; #15) e registra no `docs/MVP.md`.
4. Com a conta do GoatCounter criada (#20), abrir o site, concluir uma compra e conferir no painel a visita e o evento `compra-concluida`.

### O que é do responsável (sem segredos neste arquivo)

| Passo | Issue |
|---|---|
| Criar o serviço pelo Blueprint e conferir a demo | #4 |
| Criar a conta do GoatCounter `douglasabnovato` | #20 |
| Ligar os alertas do Dependabot | #35 |

Nenhum valor secreto é digitado: o `JWT_SECRET` é gerado pelo Render (`generateValue: true`), e o banco é o SQLite dentro do serviço.
