/*
 * validators.test.ts · Testes das validações e máscaras do checkout.
 */
import { describe, expect, it } from "vitest";
import { bandeira, cartaoValido, cepOk, mascaras, telefoneOk, validadeOk, validarCheckout, type DadosCheckout } from "./validators";

const valido: DadosCheckout = { nome: "Maria Souza", email: "maria@exemplo.com", telefone: "(32) 98836-7667", cep: "36010-000", rua: "Rua Halfeld", numero: "100", bairro: "Centro", cidade: "Juiz de Fora", uf: "MG", cartao: "4111 1111 1111 1111", titular: "MARIA SOUZA", validade: "12/30", cvv: "123" };

describe("validações do checkout", () => {
  it("cartão pelo algoritmo de Luhn", () => {
    expect(cartaoValido("4111 1111 1111 1111")).toBe(true);
    expect(cartaoValido("4111 1111 1111 1112")).toBe(false);
    expect(cartaoValido("1234")).toBe(false);
    expect(bandeira("5555 5555 5555 4444")).toBe("Mastercard");
  });
  it("validade não pode estar vencida", () => {
    const hoje = new Date(2026, 8, 26);
    expect(validadeOk("09/26", hoje)).toBe(true);
    expect(validadeOk("08/26", hoje)).toBe(false);
    expect(validadeOk("13/30", hoje)).toBe(false);
  });
  it("telefone, CEP e máscaras", () => {
    expect(telefoneOk("32988367667")).toBe(true);
    expect(telefoneOk("3298836")).toBe(false);
    expect(cepOk("36010-000")).toBe(true);
    expect(mascaras.telefone("32988367667")).toBe("(32) 98836-7667");
    expect(mascaras.cep("36010000")).toBe("36010-000");
    expect(mascaras.cartao("4111111111111111")).toBe("4111 1111 1111 1111");
    expect(mascaras.validade("1230")).toBe("12/30");
  });
  it("todos os campos são obrigatórios", () => {
    expect(validarCheckout(valido, new Date(2026, 8, 26))).toEqual({});
    const vazio = Object.fromEntries(Object.keys(valido).map((k) => [k, ""])) as DadosCheckout;
    expect(Object.keys(validarCheckout(vazio))).toHaveLength(Object.keys(valido).length);
    expect(validarCheckout({ ...valido, email: "maria@", uf: "XX" })).toMatchObject({ email: expect.any(String), uf: expect.any(String) });
  });
});
/* fim de validators.test.ts */
