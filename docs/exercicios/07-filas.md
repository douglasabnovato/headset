# Exercício 7 · Filas assíncronas no Laravel

## Como implementar
1. Driver no `.env`: `QUEUE_CONNECTION=redis` (ou `database`/`sqs`); para `database`, `php artisan queue:table && php artisan migrate`.
2. Criar o job: `php artisan make:job EnviarConfirmacaoPedido` (implementa `ShouldQueue`), com `$tries`, `$backoff` e `failed()`.
3. Despachar: `EnviarConfirmacaoPedido::dispatch($pedido)->onQueue('emails');` (ou `->afterCommit()` para só rodar depois da transação).
4. Rodar os workers: `php artisan queue:work --queue=emails,default` sob Supervisor/systemd; em Redis, **Horizon** para painel e métricas.
5. Falhas vão para `failed_jobs` (`queue:retry`).

## Para que serve
Tudo que é lento, pode falhar ou não precisa bloquear a resposta: e-mails e notificações, geração de PDF/nota fiscal, processamento de imagens, webhooks para parceiros, importação de planilhas, sincronização com ERP, recálculo de relatórios.

## No projeto
`server/src/lib/queue.ts` implementa o mesmo contrato em miniatura: `enfileirar("email-confirmacao", dados)` responde ao cliente na hora e o *handler* roda depois, com até 3 tentativas e espera exponencial. O teste `cria pedido em transação...` verifica que o job foi processado. Em produção, a troca natural é BullMQ + Redis (ou SQS), mantendo `enfileirar(nome, dados)`.
