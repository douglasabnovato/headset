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

1. `cd /c/ambiente-projeto/ser-mvp/headset`
2. `npm install`
3. `npm run typecheck && npm test && npm run build` (esperado: 4 testes do front e 10 da API passando)

### Etapa 2 · Subir para o GitHub

1. `git status` (não podem aparecer `server/data/`, `dist/` nem `.env`)
2. `git add -A`
3. `git commit -m "feat(deploy): API serve o front em produção, CSP, trust proxy, modo demo, CI e blueprint do Render"`
4. `git push`
5. No GitHub, aba **Actions**: o CI precisa ficar verde.

### Etapa 3 · Criar o serviço no Render

1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `headset`.
2. **New → Blueprint** e escolher `douglasabnovato/headset`.
3. Conferir o serviço `headset-store`, plano **Free**, e clicar em **Apply**.
4. Acompanhar **Logs** até aparecer `API do Headset Store em http://localhost:10000` (3 a 6 min).

### Etapa 4 · Conferir no ar

1. `/api/health` responde `{"ok":true,"demo":true}`.
2. A vitrine mostra os produtos; F5 em `/produto/...` continua funcionando.
3. Login como cliente (`cliente@headset.dev` / `Cliente@123`) e **Pedidos** mostra o histórico.
4. No checkout, o CEP preenche o endereço.
5. Como admin, enviar imagem mostra o aviso de demonstração.
6. O tema escuro continua salvo ao recarregar.

### Etapa 5 · Fechar

1. Se a URL real for diferente de `https://headset-store.onrender.com`, corrigir no `README.md`, commit e push (o Render publica sozinho).
2. No GitHub, **About → Website**: colar a URL.
