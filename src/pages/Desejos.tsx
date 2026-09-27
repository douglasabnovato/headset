/*
 * Desejos · Lista de desejos com "Mover para o carrinho" e remoção.
 */
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { moeda } from "../lib/format";
import { Vazio } from "../components/ui";

/* Página da lista de desejos. */
export default function Desejos() {
  const { desejos, alternarDesejo, adicionar } = useCart();
  const avisar = useToast();

  useEffect(() => {
    document.title = "Lista de desejos · Headset Store";
  }, []);

  if (!desejos.length) return <Vazio titulo="Sua lista de desejos está vazia" texto="Toque no coração de um produto para guardá-lo aqui." acao={<Link to="/" className="btn btn-primary">Ver catálogo</Link>} />;

  return (
    <section aria-labelledby="desejos-titulo">
      <h1 id="desejos-titulo" className="h3 mb-3">Lista de desejos</h1>
      <div className="card"><ul className="list-unstyled card-body lista-carrinho mb-0">
        {desejos.map((p) => (
          <li key={p.id} className="lista-carrinho__item">
            <img src={p.imageUrl} alt="" width={72} height={72} loading="lazy" />
            <div className="flex-grow-1">
              <Link to={`/produto/${p.slug}`} className="fw-semibold">{p.name}</Link>
              <div className="small text-body-secondary">{p.color} · {moeda(p.priceCents)}</div>
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button type="button" className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={() => { const q = adicionar(p); alternarDesejo(p); avisar(q ? `${p.name} movido para o carrinho.` : "Sem estoque no momento.", q ? "sucesso" : "erro"); }}>
                {p.stock <= 0 ? "Esgotado" : "Mover para o carrinho"}
              </button>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => { alternarDesejo(p); avisar("Removido da lista de desejos.", "info"); }} aria-label={`Remover ${p.name} da lista de desejos`}>Remover</button>
            </div>
          </li>
        ))}
      </ul></div>
    </section>
  );
}
/* fim de Desejos */
