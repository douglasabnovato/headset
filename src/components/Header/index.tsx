/*
 * Header · Cabeçalho com marca, busca, links, sessão, carrinho e troca de
 * tema claro/escuro (Bootstrap data-bs-theme, preferência salva).
 */
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import usePersistedState from "../../utils/usePersistedState";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

/* Cabeçalho da loja. */
export default function Header() {
  const [tema, setTema] = usePersistedState<"light" | "dark">("headset:tema", window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const { user, sair } = useAuth();
  const { quantidadeTotal, desejos } = useCart();
  const avisar = useToast();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const [busca, setBusca] = useState(params.get("q") ?? "");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", tema);
  }, [tema]);

  useEffect(() => setBusca(params.get("q") ?? ""), [params]);

  /* Envia a busca para o catálogo. */
  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const q = busca.trim();
    navegar(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setMenuAberto(false);
  };

  /* Encerra a sessão e volta à vitrine. */
  const sairDaConta = async () => {
    await sair();
    avisar("Você saiu da sua conta.", "info");
    navegar("/");
  };

  return (
    <header className="topo sticky-top">
      <nav className="navbar navbar-expand-lg" aria-label="Principal">
        <div className="container">
          <Link className="navbar-brand marca" to="/">
            <span className="marca__icone" aria-hidden="true">🎧</span> Headset<span className="marca__store">store</span>
          </Link>
          <button className="navbar-toggler" type="button" aria-controls="menu-principal" aria-expanded={menuAberto} aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuAberto(!menuAberto)}>
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${menuAberto ? "show" : ""}`} id="menu-principal">
            <form className="busca d-flex my-2 my-lg-0 mx-lg-4 flex-grow-1" role="search" onSubmit={buscar}>
              <label htmlFor="busca-topo" className="visually-hidden">Buscar headphones</label>
              <input id="busca-topo" className="form-control" type="search" placeholder="Buscar por modelo, cor ou tipo" value={busca} onChange={(e) => setBusca(e.target.value)} />
              <button className="btn btn-primary ms-2" type="submit">Buscar</button>
            </form>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1" onClick={() => setMenuAberto(false)}>
              <li className="nav-item"><NavLink className="nav-link" to="/desejos">Desejos{desejos.length > 0 && <span className="badge text-bg-secondary ms-1">{desejos.length}</span>}</NavLink></li>
              {user ? (
                <>
                  <li className="nav-item"><NavLink className="nav-link" to="/pedidos">Meus pedidos</NavLink></li>
                  {user.role === "admin" && <li className="nav-item"><NavLink className="nav-link" to="/admin/produtos">Admin</NavLink></li>}
                  <li className="nav-item"><button type="button" className="btn btn-link nav-link" onClick={sairDaConta}>Sair <span className="visually-hidden">da conta de {user.name}</span></button></li>
                </>
              ) : (
                <li className="nav-item"><NavLink className="nav-link" to="/entrar">Entrar</NavLink></li>
              )}
              <li className="nav-item">
                <NavLink className="nav-link carrinho-link" to="/carrinho" aria-label={`Carrinho com ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`}>
                  <span aria-hidden="true">🛒</span> Carrinho <span className="badge rounded-pill text-bg-primary" aria-hidden="true">{quantidadeTotal}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <button type="button" className="btn btn-outline-secondary btn-sm tema-btn ms-lg-2" aria-pressed={tema === "dark"} onClick={() => setTema(tema === "dark" ? "light" : "dark")}>
                  {tema === "dark" ? "☀️ Tema claro" : "🌙 Tema escuro"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
/* fim de Header */
