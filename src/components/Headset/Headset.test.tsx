/*
 * Headset.test.tsx · O destaque mostra a imagem antes da API (#15) e reaproveita o mesmo <img> depois.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import type { Produto } from "../../api/client";
import { CartProvider } from "../../context/CartContext";
import { ToastProvider } from "../../context/ToastContext";
import Headset, { DESTAQUE_IMAGEM } from ".";

const produto: Produto = {
  id: 1,
  name: "Headset Kitty Quartz",
  slug: "headset-kitty-quartz-rosa-quartzo",
  description: "Headset gamer.",
  priceCents: 79900,
  compareAtCents: 159900,
  imageUrl: DESTAQUE_IMAGEM,
  type: "gamer",
  connection: "cabo",
  color: "Rosa quartzo",
  stock: 10,
  active: true,
};

const comProvedores = (filho: ReactNode) => (
  <MemoryRouter>
    <ToastProvider>
      <CartProvider>{filho}</CartProvider>
    </ToastProvider>
  </MemoryRouter>
);

describe("Headset (destaque)", () => {
  it("sem o produto, já mostra a imagem e avisa que carrega", () => {
    const { container } = render(comProvedores(<Headset produto={null} />));
    const img = container.querySelector(".destaque__imagem img");
    expect(img?.getAttribute("src")).toBe(DESTAQUE_IMAGEM);
    expect(img?.getAttribute("alt")).toBe("");
    expect(screen.getByRole("status").textContent).toContain("Carregando o destaque");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("com o produto, usa o mesmo <img> e mostra título, preço e ações", () => {
    const { container, rerender } = render(comProvedores(<Headset produto={null} />));
    const antes = container.querySelector(".destaque__imagem img");
    rerender(comProvedores(<Headset produto={produto} />));
    const depois = container.querySelector(".destaque__imagem img");
    expect(depois).toBe(antes);
    expect(depois?.getAttribute("alt")).toBe("Headset Kitty Quartz na cor Rosa quartzo");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Headset Kitty Quartz");
    expect(screen.getByRole("button", { name: "Adicionar ao carrinho" })).toBeTruthy();
  });
});
