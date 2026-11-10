/*
 * medicao.test.ts · O GoatCounter só entra no build de produção, fora do
 * Playwright, e o evento da compra só sai com o contador carregado (D5).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENDERECO_CONTAGEM, contarEvento, deveMedir, iniciarMedicao } from "./medicao";

const seletor = "script[data-goatcounter]";

afterEach(() => {
  document.querySelectorAll(seletor).forEach((s) => s.remove());
});

describe("medição de uso", () => {
  it("não carrega em desenvolvimento nem nos testes", () => {
    expect(iniciarMedicao(document, { producao: import.meta.env.PROD, automatizado: false })).toBe(false);
    expect(document.querySelector(seletor)).toBeNull();
  });

  it("não carrega em navegador automatizado, mesmo no build", () => {
    expect(deveMedir({ producao: true, automatizado: true })).toBe(false);
    iniciarMedicao(document, { producao: true, automatizado: true });
    expect(document.querySelector(seletor)).toBeNull();
  });

  it("carrega uma vez no build de produção, com o endereço do portfólio", () => {
    iniciarMedicao(document, { producao: true, automatizado: false });
    iniciarMedicao(document, { producao: true, automatizado: false });
    const scripts = document.querySelectorAll<HTMLScriptElement>(seletor);
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.dataset.goatcounter).toBe(ENDERECO_CONTAGEM);
  });

  it("conta a compra só com o contador carregado, sem dado do pedido", () => {
    expect(contarEvento("compra-concluida", {} as Window)).toBe(false);
    const count = vi.fn();
    expect(contarEvento("compra-concluida", { goatcounter: { count } } as unknown as Window)).toBe(true);
    expect(count).toHaveBeenCalledWith({ path: "compra-concluida", event: true });
  });
});
/* fim de medicao.test.ts */
