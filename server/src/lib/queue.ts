/*
 * queue.ts · Fila assíncrona em processo com tentativas e espera exponencial.
 * Demonstra o padrão do exercício 7 (Laravel Queues): a requisição responde
 * rápido e o trabalho lento (e-mail de confirmação) roda depois. Em produção,
 * trocar por BullMQ + Redis ou SQS mantendo enfileirar(nome, dados).
 */
type Tarefa = { nome: string; dados: unknown; tentativa: number };
type Handler = (dados: any) => Promise<void> | void;

export class Fila {
  private handlers = new Map<string, Handler>();
  private pendentes: Tarefa[] = [];
  private rodando = false;
  processadas: string[] = [];
  falhas: string[] = [];

  /* Registra a função que processa um tipo de tarefa. */
  registrar(nome: string, handler: Handler) {
    this.handlers.set(nome, handler);
  }

  /* Coloca uma tarefa na fila e agenda o processamento. */
  enfileirar(nome: string, dados: unknown) {
    this.pendentes.push({ nome, dados, tentativa: 1 });
    setImmediate(() => this.processar());
  }

  /* Processa as tarefas em ordem; reenvia até 3 vezes em caso de erro. */
  private async processar() {
    if (this.rodando) return;
    this.rodando = true;
    while (this.pendentes.length) {
      const t = this.pendentes.shift()!;
      try {
        await this.handlers.get(t.nome)?.(t.dados);
        this.processadas.push(t.nome);
      } catch (e) {
        if (t.tentativa < 3) {
          setTimeout(() => {
            this.pendentes.push({ ...t, tentativa: t.tentativa + 1 });
            this.processar();
          }, 2 ** t.tentativa * 100);
        } else {
          this.falhas.push(t.nome);
          console.error(`[fila] ${t.nome} falhou após 3 tentativas`, e);
        }
      }
    }
    this.rodando = false;
  }

  /* Aguarda a fila esvaziar (usado nos testes). */
  async drenar() {
    while (this.pendentes.length || this.rodando) await new Promise((r) => setTimeout(r, 5));
  }
}
/* fim de queue.ts */
