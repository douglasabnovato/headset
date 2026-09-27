/*
 * Produto · Página de detalhe com preço de/por, estoque, quantidade,
 * carrinho e lista de desejos; 404 amigável para produto inexistente.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CONEXOES, TIPOS, type Produto as P } from "../api/client";
import { useApi } from "../hooks/useApi";
import { moeda } from "../lib/format";
import { retrato, useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Carregando, Quantidade, Vazio } from "../components/ui";

/* Página do produto. */
export default function Produto() {
  const { slug } = useParams();
  const { dados, erro, carregando } = useApi<{ product: P }>(`/products/${slug}`);
  const { adicionar, alternarDesejo, ehDesejo, itens } = useCart();
  const avisar = useToast();
  const [qtd, setQtd] = useState(1);
  const p = dados?.product;

  useEffect(() => {
    if (p) document.title = `${p.name} ${p.color} · Headset Store`;
  }, [p]);

  if (carregando) return <Carregando texto="Carregando produto…" />;
  if (erro || !p) return <Vazio titulo={erro?.status === 404 ? "Produto não encontrado" : "Não foi possível carregar"} texto={erro?.message} acao={<Link to="/" className="btn btn-primary">Ver catálogo</Link>} />;

  const noCarrinho = itens.find((i) => i.produto.id === p.id)?.quantidade ?? 0;
  const disponivel = Math.max(0, p.stock - noCarrinho);
  const desejo = ehDesejo(p.id);

  return (
    <article className="produto row g-4 align-items-start">
      <nav aria-label="Trilha" className="col-12">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/">Início</Link></li>
          <li className="breadcrumb-item"><Link to={`/?type=${p.type}`}>{TIPOS[p.type]}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{p.name}</li>
        </ol>
      </nav>
      <div className="col-md-6">
        <div className="produto__imagem"><img src={p.imageUrl} alt={`${p.name} na cor ${p.color}`} width={400} height={400} /></div>
      </div>
      <div className="col-md-6">
        <p className="produto-card__meta">{TIPOS[p.type]} · {CONEXOES[p.connection]}</p>
        <h1 className="h2">{p.name}</h1>
        <p className="text-body-secondary">Cor: {p.color}</p>
        {p.compareAtCents && <p className="preco-de mb-0"><span className="visually-hidden">De </span>{moeda(p.compareAtCents)}</p>}
        <p className="display-6 fw-bold mb-1"><span className="visually-hidden">Por </span>{moeda(p.priceCents)}</p>
        <p className="small text-body-secondary">ou 10x de {moeda(Math.round(p.priceCents / 10))} sem juros {p.priceCents >= 29900 && <span className="badge badge-frete ms-1">Frete grátis</span>}</p>
        <p>{p.description}</p>
        <p className="estoque">
          <span className={`estoque__bola ${p.stock <= 0 ? "estoque__bola--zero" : ""}`} aria-hidden="true" />
          {p.stock <= 0 ? "Esgotado" : p.stock === 1 ? "Última unidade" : p.stock < 5 ? `Últimas ${p.stock} unidades` : "Em estoque"}
          {noCarrinho > 0 && ` · ${noCarrinho} no seu carrinho`}
        </p>
        {p.stock > 0 && (
          <div className="d-flex flex-wrap gap-2 align-items-center my-3">
            <Quantidade valor={Math.min(qtd, Math.max(1, disponivel))} max={Math.max(1, disponivel)} onChange={setQtd} rotulo={p.name} />
            <button type="button" className="btn btn-game" disabled={disponivel <= 0} onClick={() => { const q = adicionar(retrato(p), qtd); avisar(`${p.name} no carrinho (${q}).`); setQtd(1); }}>
              {disponivel <= 0 ? "Limite de estoque no carrinho" : "Adicionar ao carrinho"}
            </button>
          </div>
        )}
        <button type="button" className="btn btn-outline-primary" aria-pressed={desejo} onClick={() => avisar(alternarDesejo(retrato(p)) ? "Adicionado à lista de desejos." : "Removido da lista de desejos.", "info")}>
          {desejo ? "♥ Na lista de desejos" : "♡ Adicionar à lista de desejos"}
        </button>
      </div>
    </article>
  );
}
/* fim de Produto */
