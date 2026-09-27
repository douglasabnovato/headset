/*
 * Footer · Rodapé com políticas resumidas e créditos.
 */
import { Link } from "react-router-dom";

/* Rodapé da loja. */
export default function Footer() {
  return (
    <footer className="rodape mt-5">
      <div className="container py-4 d-flex flex-column flex-md-row gap-3 justify-content-between">
        <div>
          <p className="fw-bold mb-1">Headset Store</p>
          <p className="small mb-0">Loja de estudo · marcas e produtos fictícios · pagamento simulado.</p>
        </div>
        <ul className="list-unstyled small mb-0">
          <li>Frete grátis a partir de R$ 299,00</li>
          <li>Troca em até 7 dias</li>
          <li><Link to="/pedidos">Acompanhar pedidos</Link></li>
        </ul>
      </div>
    </footer>
  );
}
/* fim de Footer */
