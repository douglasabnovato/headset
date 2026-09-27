/*
 * Pedidos · Histórico de compras do cliente e detalhe de um pedido,
 * com "Comprar de novo".
 */
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Pedido } from "../api/client";
import { useApi } from "../hooks/useApi";
import { data, moeda, STATUS } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Carregando, Vazio } from "../components/ui";

/* Botão que recoloca os itens ativos do pedido no carrinho. */
function ComprarDeNovo({ pedido }: { pedido: Pedido }) {
  const { adicionar } = useCart();
  const avisar = useToast();
  const navegar = useNavigate();
  const ativos = pedido.items.filter((i) => i.product?.active);
  return (
    <button type="button" className="btn btn-outline-primary btn-sm" disabled={!ativos.length} onClick={() => {
      ativos.forEach((i) => adicionar({ id: i.productId, name: i.name, slug: i.product!.slug, imageUrl: i.product!.imageUrl, priceCents: i.unitPriceCents, stock: 99, color: "" }, i.quantity));
      avisar(`${ativos.length} ${ativos.length === 1 ? "item voltou" : "itens voltaram"} para o carrinho. Preços e estoque serão atualizados.`);
      navegar("/carrinho");
    }}>Comprar de novo</button>
  );
}

/* Lista de pedidos. */
export function Pedidos() {
  const { dados, erro, carregando, recarregar } = useApi<{ orders: Pedido[] }>("/orders");
  useEffect(() => {
    document.title = "Meus pedidos · Headset Store";
  }, []);
  if (carregando) return <Carregando texto="Carregando seus pedidos…" />;
  if (erro) return <Vazio titulo="Não foi possível carregar seus pedidos" texto={erro.message} acao={<button className="btn btn-primary" onClick={recarregar}>Tentar de novo</button>} />;
  if (!dados?.orders.length) return <Vazio titulo="Você ainda não fez pedidos" acao={<Link to="/" className="btn btn-primary">Ver catálogo</Link>} />;
  return (
    <section aria-labelledby="pedidos-titulo">
      <h1 id="pedidos-titulo" className="h3 mb-3">Meus pedidos</h1>
      <ul className="list-unstyled d-grid gap-3">
        {dados.orders.map((o) => (
          <li key={o.id} className="card pedido-card">
            <div className="card-body d-flex flex-wrap gap-3 align-items-center">
              <div className="d-flex">{o.items.slice(0, 3).map((i) => <img key={i.id} src={i.product?.imageUrl} alt="" width={48} height={48} className="pedido-card__mini" loading="lazy" />)}</div>
              <div className="flex-grow-1">
                <h2 className="h6 mb-1"><Link to={`/pedidos/${o.id}`}>Pedido #{o.id}</Link></h2>
                <p className="small text-body-secondary mb-0">{data(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} {o.items.length === 1 && o.items[0].quantity === 1 ? "item" : "itens"}</p>
              </div>
              <span className={`badge text-bg-${STATUS[o.status].cor}`}>{STATUS[o.status].rotulo}</span>
              <strong>{moeda(o.totalCents)}</strong>
              <ComprarDeNovo pedido={o} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Detalhe de um pedido. */
export function PedidoDetalhe() {
  const { id } = useParams();
  const { dados, erro, carregando } = useApi<{ order: Pedido }>(`/orders/${id}`);
  const o = dados?.order;
  useEffect(() => {
    document.title = `Pedido #${id} · Headset Store`;
  }, [id]);
  if (carregando) return <Carregando texto="Carregando pedido…" />;
  if (erro || !o) return <Vazio titulo="Pedido não encontrado" texto={erro?.message} acao={<Link to="/pedidos" className="btn btn-primary">Meus pedidos</Link>} />;
  return (
    <section aria-labelledby="pedido-titulo">
      <Link to="/pedidos" className="d-inline-block mb-2">← Meus pedidos</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 id="pedido-titulo" className="h3 mb-0">Pedido #{o.id}</h1>
        <span className={`badge fs-6 text-bg-${STATUS[o.status].cor}`}>{STATUS[o.status].rotulo}</span>
      </div>
      <p className="text-body-secondary">Feito em {data(o.createdAt)}</p>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card"><div className="card-body">
            <h2 className="h5">Itens</h2>
            <ul className="list-unstyled lista-carrinho mb-0">
              {o.items.map((i) => (
                <li key={i.id} className="lista-carrinho__item">
                  <img src={i.product?.imageUrl} alt="" width={64} height={64} loading="lazy" />
                  <div className="flex-grow-1">
                    {i.product?.active ? <Link to={`/produto/${i.product.slug}`}>{i.name}</Link> : <span>{i.name} <span className="badge text-bg-secondary">indisponível</span></span>}
                    <div className="small text-body-secondary">{i.quantity} × {moeda(i.unitPriceCents)}</div>
                  </div>
                  <strong>{moeda(i.totalCents)}</strong>
                </li>
              ))}
            </ul>
          </div></div>
        </div>
        <div className="col-lg-4 d-grid gap-3 align-content-start">
          <div className="card"><div className="card-body">
            <h2 className="h6">Pagamento</h2>
            <dl className="resumo mb-2">
              <div><dt>Subtotal</dt><dd>{moeda(o.subtotalCents)}</dd></div>
              <div><dt>Frete</dt><dd>{o.shippingCents ? moeda(o.shippingCents) : "Grátis"}</dd></div>
              <div className="resumo__total"><dt>Total</dt><dd>{moeda(o.totalCents)}</dd></div>
            </dl>
            <p className="small mb-0">Cartão final {o.cardLast4}</p>
          </div></div>
          <div className="card"><div className="card-body">
            <h2 className="h6">Entrega</h2>
            <address className="small mb-0">{o.customerName}<br />{o.street}, {o.number} · {o.district}<br />{o.city}/{o.state} · CEP {o.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}</address>
          </div></div>
          <ComprarDeNovo pedido={o} />
        </div>
      </div>
    </section>
  );
}
/* fim de Pedidos */
