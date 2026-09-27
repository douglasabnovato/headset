/*
 * App.tsx · Rotas da loja (carregadas sob demanda), provedores de sessão,
 * carrinho e avisos, e o layout com "pular para o conteúdo".
 */
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Carregando, Protegida, Vazio } from "./components/ui";
import Home from "./pages/Home";

const Produto = lazy(() => import("./pages/Produto"));
const Carrinho = lazy(() => import("./pages/Carrinho"));
const Desejos = lazy(() => import("./pages/Desejos"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Entrar = lazy(() => import("./pages/Entrar"));
const Pedidos = lazy(() => import("./pages/Pedidos").then((m) => ({ default: m.Pedidos })));
const PedidoDetalhe = lazy(() => import("./pages/Pedidos").then((m) => ({ default: m.PedidoDetalhe })));
const AdminProdutos = lazy(() => import("./pages/admin/Produtos"));
const ProdutoForm = lazy(() => import("./pages/admin/ProdutoForm"));
const Relatorios = lazy(() => import("./pages/admin/Relatorios"));

/* Leva o foco e a rolagem ao topo a cada troca de página. */
function AoTrocarDePagina() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("conteudo")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

/* Aplicação. */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <a href="#conteudo" className="pular">Pular para o conteúdo</a>
            <AoTrocarDePagina />
            <Header />
            <main id="conteudo" className="container py-4" tabIndex={-1}>
              <Suspense fallback={<Carregando />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/produto/:slug" element={<Produto />} />
                  <Route path="/carrinho" element={<Carrinho />} />
                  <Route path="/desejos" element={<Desejos />} />
                  <Route path="/checkout" element={<Protegida><Checkout /></Protegida>} />
                  <Route path="/entrar" element={<Entrar />} />
                  <Route path="/cadastro" element={<Entrar modo="cadastro" />} />
                  <Route path="/pedidos" element={<Protegida><Pedidos /></Protegida>} />
                  <Route path="/pedidos/:id" element={<Protegida><PedidoDetalhe /></Protegida>} />
                  <Route path="/admin/produtos" element={<Protegida admin><AdminProdutos /></Protegida>} />
                  <Route path="/admin/produtos/novo" element={<Protegida admin><ProdutoForm /></Protegida>} />
                  <Route path="/admin/produtos/:id" element={<Protegida admin><ProdutoForm key="editar" /></Protegida>} />
                  <Route path="/admin/relatorios" element={<Protegida admin><Relatorios /></Protegida>} />
                  <Route path="*" element={<Vazio titulo="Página não encontrada" texto="O endereço pode estar incorreto." acao={<Link to="/" className="btn btn-primary">Voltar à loja</Link>} />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
/* fim de App.tsx */
