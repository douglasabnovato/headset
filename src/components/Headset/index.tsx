/*
 * Headset · Card de destaque herdado do layout original do projeto
 * (frete grátis, preço de/por, oferta, botão "físico" de jogo, estoque e
 * ações secundárias), agora ligado a um produto real do catálogo.
 */
import { Link } from "react-router-dom";
import type { Produto } from "../../api/client";
import { moeda } from "../../lib/format";
import { retrato, useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Carregando } from "../ui";

/* Produto do destaque e a imagem dele: o index.html já pede a imagem, antes do JavaScript (#15). */
export const DESTAQUE_SLUG = "headset-kitty-quartz-rosa-quartzo";
export const DESTAQUE_IMAGEM = "/produtos/kitty-quartz.png";

/*
 * Destaque da vitrine. Sem o produto (a API ainda não respondeu), mostra já a
 * imagem, que é o maior elemento da tela (LCP), e reserva o espaço do texto.
 * O <img> é o mesmo nó do estado sem produto ao carregado (a troca não gera LCP novo); o esqueleto do index.html é outro nó, e src/lib/esperarDestaque.ts segura a montagem até ele contar como LCP.
 */
export default function Headset({ produto }: { produto: Produto | null }) {
  const { adicionar, alternarDesejo, ehDesejo } = useCart();
  const avisar = useToast();
  if (!produto) {
    return (
      <section className="destaque">
        <div className="destaque__imagem">
          <img src={DESTAQUE_IMAGEM} alt="" width={249} height={223} fetchPriority="high" />
        </div>
        <div className="destaque__detalhes destaque__detalhes--carregando">
          <Carregando texto="Carregando o destaque…" />
        </div>
      </section>
    );
  }
  const desejo = ehDesejo(produto.id);
  const semEstoque = produto.stock <= 0;

  /* Adiciona ao carrinho e confirma. */
  const comprar = () => {
    const q = adicionar(retrato(produto));
    avisar(q ? `${produto.name} no carrinho (${q}).` : "Produto sem estoque.", q ? "sucesso" : "erro");
  };

  return (
    <section className="destaque" aria-labelledby="destaque-titulo">
      <div className="destaque__imagem">
        <img src={produto.imageUrl} alt={`${produto.name} na cor ${produto.color}`} width={249} height={223} fetchPriority="high" />
      </div>
      <div className="destaque__detalhes">
        <span className="selo-frete">Frete grátis</span>
        <h1 id="destaque-titulo" className="destaque__titulo">{produto.name} <small>{produto.color}</small></h1>
        {produto.compareAtCents && <p className="preco-de"><span className="visually-hidden">De </span>{moeda(produto.compareAtCents)}</p>}
        <p className="preco-por"><span className="visually-hidden">Por </span>{moeda(produto.priceCents)}</p>
        <p className="destaque__oferta">Oferta válida enquanto durar o estoque!</p>
        <button type="button" className="btn btn-game" onClick={comprar} disabled={semEstoque}>{semEstoque ? "Esgotado" : "Adicionar ao carrinho"}</button>
        <p className="estoque"><span className={`estoque__bola ${semEstoque ? "estoque__bola--zero" : ""}`} aria-hidden="true" />{semEstoque ? "Sem estoque no momento." : `${produto.stock > 50 ? "50+" : produto.stock} unidades em estoque.`}</p>
        <div className="destaque__acoes">
          <Link className="btn btn-outline-primary" to={`/produto/${produto.slug}`}>Ver detalhes</Link>
          <button type="button" className="btn btn-outline-primary" aria-pressed={desejo} onClick={() => avisar(alternarDesejo(retrato(produto)) ? "Adicionado à lista de desejos." : "Removido da lista de desejos.", "info")}>
            {desejo ? "♥ Na lista de desejos" : "♡ Lista de desejos"}
          </button>
        </div>
      </div>
    </section>
  );
}
/* fim de Headset */
