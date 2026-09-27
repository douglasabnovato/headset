/*
 * ProductCard · Card do catálogo com imagem, tipo, preço, desejos e compra rápida.
 */
import { Link } from "react-router-dom";
import { CONEXOES, TIPOS, type Produto } from "../api/client";
import { moeda } from "../lib/format";
import { retrato, useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

/* Card de produto. */
export default function ProductCard({ produto }: { produto: Produto }) {
  const { adicionar, alternarDesejo, ehDesejo } = useCart();
  const avisar = useToast();
  const desejo = ehDesejo(produto.id);
  const esgotado = produto.stock <= 0;

  return (
    <article className="card produto-card h-100">
      <Link to={`/produto/${produto.slug}`} className="produto-card__imagem" tabIndex={-1} aria-hidden="true">
        <img src={produto.imageUrl} alt="" width={400} height={400} loading="lazy" decoding="async" />
      </Link>
      <button type="button" className={`produto-card__desejo ${desejo ? "ativo" : ""}`} aria-pressed={desejo} aria-label={`${desejo ? "Remover" : "Adicionar"} ${produto.name} ${produto.color} ${desejo ? "da" : "à"} lista de desejos`} onClick={() => avisar(alternarDesejo(retrato(produto)) ? "Adicionado à lista de desejos." : "Removido da lista de desejos.", "info")}>
        {desejo ? "♥" : "♡"}
      </button>
      <div className="card-body d-flex flex-column">
        <p className="produto-card__meta">{TIPOS[produto.type]} · {CONEXOES[produto.connection]}</p>
        <h2 className="produto-card__nome h6"><Link to={`/produto/${produto.slug}`} className="stretched-link-titulo">{produto.name}</Link> <span className="produto-card__cor">{produto.color}</span></h2>
        <p className="mb-1">
          {produto.compareAtCents && <s className="text-body-secondary small me-2"><span className="visually-hidden">De </span>{moeda(produto.compareAtCents)}</s>}
          <strong className="produto-card__preco"><span className="visually-hidden">Por </span>{moeda(produto.priceCents)}</strong>
        </p>
        <p className="small mb-3">
          {esgotado ? <span className="badge text-bg-secondary">Esgotado</span> : produto.stock < 5 ? <span className="badge text-bg-warning">{produto.stock === 1 ? "Última unidade" : `Últimas ${produto.stock} unidades`}</span> : produto.priceCents >= 29900 ? <span className="badge badge-frete">Frete grátis</span> : <span className="text-body-secondary">Em estoque</span>}
        </p>
        <button type="button" className="btn btn-primary mt-auto" disabled={esgotado} onClick={() => { const q = adicionar(retrato(produto)); avisar(q ? `${produto.name} no carrinho (${q}).` : "Sem estoque.", q ? "sucesso" : "erro"); }} aria-label={esgotado ? `${produto.name} esgotado` : `Adicionar ${produto.name} ${produto.color} ao carrinho`}>
          {esgotado ? "Esgotado" : "Adicionar"}
        </button>
      </div>
    </article>
  );
}
/* fim de ProductCard */
