/*
 * admin/Produtos · Lista de produtos (inclui inativos) com busca, edição e
 * exclusão confirmada. Produtos já vendidos são inativados pela API.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError, TIPOS, type Pagina, type Produto } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../context/ToastContext";
import { moeda } from "../../lib/format";
import { Carregando, Vazio } from "../../components/ui";

/* Painel de produtos do admin. */
export default function AdminProdutos() {
  const [pagina, setPagina] = useState(1);
  const [q, setQ] = useState("");
  const [busca, setBusca] = useState("");
  const { dados, erro, carregando, recarregar } = useApi<Pagina<Produto>>(`/products?all=1&sort=novidades&page=${pagina}${busca ? `&q=${encodeURIComponent(busca)}` : ""}`);
  const [excluir, setExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const avisar = useToast();

  useEffect(() => {
    document.title = "Admin · Produtos · Headset Store";
  }, []);

  useEffect(() => {
    if (excluir) dialogo.current?.showModal();
    else dialogo.current?.close();
  }, [excluir]);

  /* Confirma a exclusão e informa se virou inativação. */
  const confirmar = async () => {
    if (!excluir) return;
    setExcluindo(true);
    try {
      const r = await api<{ inactivated?: boolean; message?: string } | undefined>(`/products/${excluir.id}`, { method: "DELETE" });
      avisar(r?.inactivated ? r.message ?? "Produto inativado." : `${excluir.name} excluído.`, r?.inactivated ? "info" : "sucesso");
      setExcluir(null);
      recarregar();
    } catch (e) {
      avisar(e instanceof ApiError ? e.message : "Não foi possível excluir.", "erro");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <section aria-labelledby="adm-titulo">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h1 id="adm-titulo" className="h3 mb-0">Produtos</h1>
        <div className="d-flex gap-2">
          <Link to="/admin/relatorios" className="btn btn-outline-primary">Relatórios</Link>
          <Link to="/admin/produtos/novo" className="btn btn-primary">+ Novo produto</Link>
        </div>
      </div>
      <form className="d-flex gap-2 mb-3" role="search" onSubmit={(e) => { e.preventDefault(); setPagina(1); setBusca(q.trim()); }}>
        <label htmlFor="adm-busca" className="visually-hidden">Buscar produto</label>
        <input id="adm-busca" type="search" className="form-control" placeholder="Buscar por nome, cor ou descrição" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-outline-secondary" type="submit">Buscar</button>
      </form>
      {carregando && !dados && <Carregando />}
      {erro && <Vazio titulo="Erro ao carregar" texto={erro.message} acao={<button className="btn btn-primary" onClick={recarregar}>Tentar de novo</button>} />}
      {dados && !dados.items.length && <Vazio titulo="Nenhum produto encontrado" acao={<button className="btn btn-primary" onClick={() => { setQ(""); setBusca(""); }}>Limpar busca</button>} />}
      {dados && dados.items.length > 0 && (
        <div className="table-responsive card">
          <table className="table align-middle mb-0">
            <caption className="px-3">{dados.total} produtos · página {dados.page} de {dados.pages}</caption>
            <thead><tr><th scope="col">Produto</th><th scope="col">Tipo</th><th scope="col" className="text-end">Preço</th><th scope="col" className="text-end">Estoque</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Ações</span></th></tr></thead>
            <tbody>
              {dados.items.map((p) => (
                <tr key={p.id}>
                  <td><div className="d-flex align-items-center gap-2"><img src={p.imageUrl} alt="" width={44} height={44} className="rounded" loading="lazy" /><div><div className="fw-semibold">{p.name}</div><div className="small text-body-secondary">{p.color}</div></div></div></td>
                  <td>{TIPOS[p.type]}</td>
                  <td className="text-end">{moeda(p.priceCents)}</td>
                  <td className={`text-end ${p.stock === 0 ? "text-danger fw-semibold" : ""}`}>{p.stock}</td>
                  <td>{p.active ? <span className="badge text-bg-success">Ativo</span> : <span className="badge text-bg-secondary">Inativo</span>}</td>
                  <td className="text-end text-nowrap">
                    <Link className="btn btn-sm btn-outline-primary me-1" to={`/admin/produtos/${p.id}`} aria-label={`Editar ${p.name} ${p.color}`}>Editar</Link>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => setExcluir(p)} aria-label={`Excluir ${p.name} ${p.color}`}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dados && dados.pages > 1 && (
        <nav aria-label="Páginas" className="mt-3"><ul className="pagination justify-content-center">
          {Array.from({ length: dados.pages }, (_, i) => i + 1).map((n) => <li key={n} className={`page-item ${n === dados.page ? "active" : ""}`}><button className="page-link" aria-current={n === dados.page ? "page" : undefined} onClick={() => setPagina(n)}>{n}</button></li>)}
        </ul></nav>
      )}
      <dialog ref={dialogo} className="dialogo" aria-labelledby="dlg-titulo" onClose={() => setExcluir(null)}>
        <h2 id="dlg-titulo" className="h5">Excluir produto?</h2>
        <p><strong>{excluir?.name} {excluir?.color}</strong> sairá do catálogo. Se ele já tiver vendas, será apenas inativado para manter o histórico.</p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" type="button" onClick={() => setExcluir(null)}>Cancelar</button>
          <button className="btn btn-danger" type="button" onClick={confirmar} disabled={excluindo}>{excluindo && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}Excluir</button>
        </div>
      </dialog>
    </section>
  );
}
/* fim de admin/Produtos */
