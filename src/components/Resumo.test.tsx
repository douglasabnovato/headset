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
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.queryByText(/para frete grátis/)).toBeNull();
  });

  it("mantém a mesma região viva montada e só troca o texto (#36)", () => {
    const { rerender } = render(<Resumo cotacao={cotacao} carregando={false} />);
    const regiao = screen.getByRole("status");
    expect(regiao.textContent).toBe("");
    rerender(<Resumo cotacao={cotacao} carregando />);
    expect(screen.getByRole("status")).toBe(regiao);
    expect(regiao.textContent).toContain("Atualizando preços");
    rerender(<Resumo cotacao={cotacao} carregando={false} />);
    expect(screen.getByRole("status")).toBe(regiao);
    expect(regiao.textContent).toBe("");
  });
});
/* fim de Resumo.test.tsx */
