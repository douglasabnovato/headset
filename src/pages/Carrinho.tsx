/*
 * Carrinho · Itens, quantidades, remoção, cotação no servidor e acesso ao checkout.
 */
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useCotacao } from "../hooks/useCotacao";
import CartList, { Resumo } from "../components/CartList";
import { Vazio } from "../components/ui";

/* Página do carrinho. */
export default function Carrinho() {
  const { itens, esvaziar } = useCart();
  const { cotacao, carregando, erro } = useCotacao();
  const navegar = useNavigate();
  const bloqueado = !cotacao || carregando || cotacao.linhas.some((l) => l.problema);

  useEffect(() => {
    document.title = "Carrinho · Headset Store";
  }, []);

  if (!itens.length) return <Vazio titulo="Seu carrinho está vazio" texto="Que tal escolher um headphone?" acao={<Link to="/" className="btn btn-primary">Ver catálogo</Link>} />;

  return (
    <div className="row g-4">
      <section className="col-lg-8" aria-labelledby="carrinho-titulo">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 id="carrinho-titulo" className="h3 mb-0">Carrinho</h1>
          <button type="button" className="btn btn-link text-danger" onClick={esvaziar}>Esvaziar carrinho</button>
        </div>
        {erro && <div className="alert alert-warning" role="alert">{erro}</div>}
        <div className="card"><div className="card-body"><CartList cotacao={cotacao} /></div></div>
      </section>
      <aside className="col-lg-4" aria-labelledby="resumo-titulo">
        <div className="card resumo-card">
          <div className="card-body">
            <h2 id="resumo-titulo" className="h5">Resumo</h2>
            <Resumo cotacao={cotacao} carregando={carregando} />
            <button type="button" className="btn btn-game w-100 mt-3" disabled={bloqueado} onClick={() => navegar("/checkout")}>Finalizar compra</button>
            <Link to="/" className="btn btn-link w-100">Continuar comprando</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
/* fim de Carrinho */
