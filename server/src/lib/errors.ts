/*
 * errors.ts · Erro de aplicação com status HTTP, usado pelas rotas e
 * convertido em JSON pelo middleware de erros.
 */
export class HttpError extends Error {
  status: number;
  details?: unknown;

  /* Cria um erro com status HTTP e detalhes opcionais (ex.: campos inválidos). */
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
/* fim de errors.ts */
