/*
 * useCotacao.ts · Cota o carrinho na API sempre que ele muda (com pequena
 * espera) e sincroniza preço e estoque do retrato salvo no navegador.
 */
import { useEffect, useState } from "react";
import { api, ApiError, type Cotacao } from "../api/client";
import { useCart } from "../context/CartContext";

/* Devolve a cotação atual, o estado de carregando e o erro. */
export function useCotacao() {
  const { itens, substituir } = useCart();
  const [cotacao, setCotacao] = useState<Cotacao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const chave = itens.map((i) => `${i.produto.id}:${i.quantidade}`).join(",");

  useEffect(() => {
    if (!itens.length) {
      setCotacao(null);
      return;
    }
    let ativo = true;
    setCarregando(true);
    const t = setTimeout(() => {
      api<Cotacao>("/cart/quote", { method: "POST", json: { items: itens.map((i) => ({ productId: i.produto.id, quantity: i.quantidade })) } })
        .then((c) => {
          if (!ativo) return;
          setCotacao(c);
          setErro(null);
          const mudou = c.linhas.some((l) => {
            const i = itens.find((x) => x.produto.id === l.productId);
            return l.product && i && (i.produto.priceCents !== l.product.priceCents || i.produto.stock !== l.product.stock);
          });
          if (mudou) substituir(itens.map((i) => { const l = c.linhas.find((x) => x.productId === i.produto.id); return l?.product ? { ...i, produto: { ...i.produto, priceCents: l.product.priceCents, stock: l.product.stock } } : i; }));
        })
        .catch((e) => ativo && setErro(e instanceof ApiError ? e.message : "Não foi possível atualizar os preços."))
        .finally(() => ativo && setCarregando(false));
    }, 250);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return { cotacao, carregando, erro };
}
/* fim de useCotacao.ts */
