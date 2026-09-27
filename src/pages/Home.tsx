/*
 * Home · Vitrine: destaque + catálogo com busca, filtros, ordenação e
 * paginação guardados na URL (links compartilháveis).
 */
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CONEXOES, TIPOS, type Pagina, type Produto } from "../api/client";
import { useApi } from "../hooks/useApi";
import ProductCard from "../components/ProductCard";
import Headset from "../components/Headset";
import { Carregando, Vazio } from "../components/ui";

/* Página inicial. */
export default function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const { dados, erro, carregando, recarregar } = useApi<Pagina<Produto>>(`/products${query ? `?${query}` : ""}`);
  const destaque = useApi<{ product: Produto }>("/products/headset-kitty-quartz-rosa-quartzo");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const filtrando = ["q", "type", "connection", "sort", "page"].some((k) => params.has(k));

  useEffect(() => {
    document.title = params.get("q") ? `Busca: ${params.get("q")} · Headset Store` : "Headset Store · headphones, fones gamer e in-ear";
  }, [params]);

  /* Altera um filtro (e volta para a página 1). */
  const filtrar = (chave: string, valor: string) => {
    const p = new URLSearchParams(params);
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    if (chave !== "page") p.delete("page");
    setParams(p);
    if (chave === "page") tituloRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {!filtrando && destaque.dados && <Headset produto={destaque.dados.product} />}
      <section aria-labelledby="catalogo-titulo" className="mt-4">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
          <h2 id="catalogo-titulo" ref={tituloRef} className="h3 mb-0" tabIndex={-1}>
            {params.get("q") ? <>Resultados para “{params.get("q")}”</> : "Headphones"}
          </h2>
          <form className="filtros d-flex flex-wrap gap-2" aria-label="Filtros do catálogo" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="f-tipo" className="form-label small mb-0">Tipo</label>
              <select id="f-tipo" className="form-select form-select-sm" value={params.get("type") ?? ""} onChange={(e) => filtrar("type", e.target.value)}>
                <option value="">Todos</option>
                {Object.entries(TIPOS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-conexao" className="form-label small mb-0">Conexão</label>
              <select id="f-conexao" className="form-select form-select-sm" value={params.get("connection") ?? ""} onChange={(e) => filtrar("connection", e.target.value)}>
                <option value="">Todas</option>
                {Object.entries(CONEXOES).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-ordem" className="form-label small mb-0">Ordenar</label>
              <select id="f-ordem" className="form-select form-select-sm" value={params.get("sort") ?? "relevancia"} onChange={(e) => filtrar("sort", e.target.value === "relevancia" ? "" : e.target.value)}>
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="novidades">Novidades</option>
              </select>
            </div>
            {filtrando && <button type="button" className="btn btn-link btn-sm align-self-end" onClick={() => setParams({})}>Limpar filtros</button>}
          </form>
        </div>

        <p className="visually-hidden" role="status">{dados ? `${dados.total} produtos encontrados` : ""}</p>
        {carregando && !dados && <Carregando texto="Carregando headphones…" />}
        {erro && <Vazio titulo="Não foi possível carregar o catálogo" texto={erro.message} acao={<button className="btn btn-primary" onClick={recarregar}>Tentar de novo</button>} />}
        {dados && dados.items.length === 0 && <Vazio titulo="Nenhum headphone encontrado" texto="Tente outra palavra ou remova algum filtro." acao={<button className="btn btn-primary" onClick={() => setParams({})}>Limpar filtros</button>} />}
        {dados && dados.items.length > 0 && (
          <>
            <p className="text-body-secondary small">{dados.total} {dados.total === 1 ? "produto" : "produtos"}</p>
            <ul className={`row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 list-unstyled ${carregando ? "opacity-50" : ""}`} aria-busy={carregando}>
              {dados.items.map((p) => <li key={p.id} className="col"><ProductCard produto={p} /></li>)}
            </ul>
            {dados.pages > 1 && (
              <nav aria-label="Páginas do catálogo" className="mt-4">
                <ul className="pagination justify-content-center">
                  {Array.from({ length: dados.pages }, (_, i) => i + 1).map((n) => (
                    <li key={n} className={`page-item ${n === dados.page ? "active" : ""}`}>
                      <button type="button" className="page-link" aria-current={n === dados.page ? "page" : undefined} onClick={() => filtrar("page", n === 1 ? "" : String(n))}>{n}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
/* fim de Home */
