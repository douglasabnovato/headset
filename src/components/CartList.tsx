/*
 * CartList · Lista de itens do carrinho com quantidade, remoção e avisos
 * de estoque vindos da cotação. Usada no carrinho e no checkout.
 */
import { Link } from "react-router-dom";
import type { Cotacao } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { moeda } from "../lib/format";
import { Quantidade } from "./ui";

/* Itens do carrinho. */
export default function CartList({ cotacao, compacta = false }: { cotacao: Cotacao | null; compacta?: boolean }) {
  const { itens, alterar, remover } = useCart();
  const avisar = useToast();
  return (
    <ul className="lista-carrinho list-unstyled mb-0">
      {itens.map(({ produto: p, quantidade }) => {
        const linha = cotacao?.linhas.find((l) => l.productId === p.id);
        const problema = linha?.problema;
        return (
          <li key={p.id} className={`lista-carrinho__item ${problema ? "com-problema" : ""}`}>
            <img src={p.imageUrl} alt="" width={compacta ? 56 : 88} height={compacta ? 56 : 88} loading="lazy" />
            <div className="flex-grow-1">
              <Link to={`/produto/${p.slug}`} className="fw-semibold">{p.name}</Link>
              <div className="small text-body-secondary">{p.color} · {moeda(p.priceCents)} cada</div>
              {problema === "indisponivel" && <div className="small text-danger" role="alert">Produto indisponível. Remova para continuar.</div>}
              {problema === "estoque" && <div className="small text-danger" role="alert">Só temos {linha?.product?.stock ?? 0} em estoque. Ajuste a quantidade.</div>}
              <div className="d-flex align-items-center gap-2 mt-2">
                <Quantidade valor={quantidade} max={Math.max(quantidade, p.stock)} onChange={(n) => alterar(p.id, n)} rotulo={p.name} />
                <button type="button" className="btn btn-link btn-sm text-danger" onClick={() => { remover(p.id); avisar(`${p.name} removido do carrinho.`, "info"); }} aria-label={`Remover ${p.name} ${p.color} do carrinho`}>Remover</button>
              </div>
            </div>
            <strong className="text-nowrap">{moeda(p.priceCents * quantidade)}</strong>
          </li>
        );
      })}
    </ul>
  );
}

/* Resumo de valores (subtotal, frete e total). */
export function Resumo({ cotacao, carregando }: { cotacao: Cotacao | null; carregando: boolean }) {
  return (
    <dl className="resumo mb-0" aria-busy={carregando}>
      <div><dt>Subtotal</dt><dd>{cotacao ? moeda(cotacao.subtotalCents) : "—"}</dd></div>
      <div><dt>Frete</dt><dd>{cotacao ? (cotacao.shippingCents ? moeda(cotacao.shippingCents) : "Grátis") : "—"}</dd></div>
      {cotacao && cotacao.shippingCents > 0 && <p className="small text-body-secondary mb-2">Faltam {moeda(29900 - cotacao.subtotalCents)} para frete grátis.</p>}
      <div className="resumo__total"><dt>Total</dt><dd>{cotacao ? moeda(cotacao.totalCents) : "—"}</dd></div>
      {carregando && <p className="small mb-0" role="status"><span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />Atualizando preços…</p>}
    </dl>
  );
}
/* fim de CartList */
