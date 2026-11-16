/*
 * Resumo.test.tsx · O <dl> do resumo só tem grupos de dt e dd; os avisos ficam fora (axe: definition-list).
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Cotacao } from "../api/client";
import { Resumo } from "./CartList";

const cotacao: Cotacao = { linhas: [], subtotalCents: 19900, shippingCents: 1990, totalCents: 21890 };

afterEach(cleanup);

describe("Resumo", () => {
  it("mantém o aviso de frete e o de carregamento fora do <dl>", () => {
    const { container } = render(<Resumo cotacao={cotacao} carregando />);
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    expect([...dl!.children].map((filho) => filho.tagName)).toEqual(["DIV", "DIV", "DIV"]);
    expect(dl!.querySelector("p")).toBeNull();
    expect(screen.getByText(/para frete grátis/).closest("dl")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Atualizando preços");
  });

  it("mostra traços sem cotação e nenhum aviso", () => {
    const { container } = render(<Resumo cotacao={null} carregando={false} />);
    expect(container.querySelectorAll("dd")).toHaveLength(3);
    expect(container.textContent).toContain("—");
    expect(container.querySelector("p")).toBeNull();
  });
});
/* fim de Resumo.test.tsx */
