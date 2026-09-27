/*
 * CartContext.tsx · Carrinho e lista de desejos persistidos no navegador.
 * Guardam um "retrato" do produto só para exibição imediata; preço e
 * estoque valem sempre o que a API devolve na cotação e no pedido.
 */
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import usePersistedState from "../utils/usePersistedState";
import type { Produto } from "../api/client";

export type Retrato = Pick<Produto, "id" | "name" | "slug" | "imageUrl" | "priceCents" | "stock" | "color">;
export type ItemCarrinho = { produto: Retrato; quantidade: number };

type CartCtx = {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  adicionar: (p: Retrato, quantidade?: number) => number;
  alterar: (id: number, quantidade: number) => void;
  remover: (id: number) => void;
  esvaziar: () => void;
  substituir: (itens: ItemCarrinho[]) => void;
  desejos: Retrato[];
  alternarDesejo: (p: Retrato) => boolean;
  ehDesejo: (id: number) => boolean;
};
const Ctx = createContext<CartCtx>(null as unknown as CartCtx);

/* Reduz o produto ao retrato salvo no navegador. */
export function retrato(p: Produto | Retrato): Retrato {
  return { id: p.id, name: p.name, slug: p.slug, imageUrl: p.imageUrl, priceCents: p.priceCents, stock: p.stock, color: p.color };
}

/* Provedor do carrinho e dos desejos. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = usePersistedState<ItemCarrinho[]>("headset:carrinho", []);
  const [desejos, setDesejos] = usePersistedState<Retrato[]>("headset:desejos", []);
  const itensRef = useRef(itens);
  const desejosRef = useRef(desejos);
  itensRef.current = itens;
  desejosRef.current = desejos;

  const adicionar = useCallback(
    (p: Retrato, quantidade = 1) => {
      const atual = itensRef.current;
      const existente = atual.find((i) => i.produto.id === p.id);
      const final = Math.min(p.stock, (existente?.quantidade ?? 0) + quantidade);
      if (final <= 0) return 0;
      const novo = existente ? atual.map((i) => (i.produto.id === p.id ? { produto: p, quantidade: final } : i)) : [...atual, { produto: p, quantidade: final }];
      itensRef.current = novo;
      setItens(novo);
      return final;
    },
    [setItens]
  );

  const alterar = useCallback(
    (id: number, quantidade: number) => setItens((a) => a.map((i) => (i.produto.id === id ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.produto.stock || quantidade)) } : i))),
    [setItens]
  );
  const remover = useCallback((id: number) => setItens((a) => a.filter((i) => i.produto.id !== id)), [setItens]);
  const esvaziar = useCallback(() => setItens([]), [setItens]);
  const substituir = useCallback((novos: ItemCarrinho[]) => setItens(novos), [setItens]);

  const alternarDesejo = useCallback(
    (p: Retrato) => {
      const atual = desejosRef.current;
      const agora = !atual.some((x) => x.id === p.id);
      const novo = agora ? [...atual, p] : atual.filter((x) => x.id !== p.id);
      desejosRef.current = novo;
      setDesejos(novo);
      return agora;
    },
    [setDesejos]
  );
  const ehDesejo = useCallback((id: number) => desejos.some((d) => d.id === id), [desejos]);
  const quantidadeTotal = useMemo(() => itens.reduce((s, i) => s + i.quantidade, 0), [itens]);

  return <Ctx.Provider value={{ itens, quantidadeTotal, adicionar, alterar, remover, esvaziar, substituir, desejos, alternarDesejo, ehDesejo }}>{children}</Ctx.Provider>;
}

/* Hook de acesso ao carrinho. */
export const useCart = () => useContext(Ctx);
/* fim de CartContext.tsx */
