/*
 * admin/Relatorios · Exercício 14: estados com maior volume de vendas e os
 * 5 clientes que mais compraram, com barras proporcionais acessíveis.
 */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { moeda } from "../../lib/format";
import { Carregando, Vazio } from "../../components/ui";

type Estado = { state: string; totalCents: number; orders: number };
type Cliente = { id: number; name: string; email: string; state: string | null; totalCents: number; orders: number };

/* Tabela com barra proporcional ao maior valor. */
function Barra({ valor, max }: { valor: number; max: number }) {
  return <div className="barra" aria-hidden="true"><span style={{ width: `${Math.max(3, (valor / max) * 100)}%` }} /></div>;
}

/* Página de relatórios. */
export default function Relatorios() {
  const estados = useApi<{ rows: Estado[] }>("/reports/sales-by-state");
  const clientes = useApi<{ rows: Cliente[] }>("/reports/top-customers");
  useEffect(() => {
    document.title = "Admin · Relatórios · Headset Store";
  }, []);
  const maxE = Math.max(1, ...(estados.dados?.rows.map((r) => r.totalCents) ?? [1]));
  const maxC = Math.max(1, ...(clientes.dados?.rows.map((r) => r.totalCents) ?? [1]));
  return (
    <section aria-labelledby="rel-titulo">
      <Link to="/admin/produtos" className="d-inline-block mb-2">← Produtos</Link>
      <h1 id="rel-titulo" className="h3 mb-3">Relatórios de vendas</h1>
      <p className="text-body-secondary small">Pedidos cancelados não entram na soma.</p>
      <div className="row g-4">
        <div className="col-lg-6"><div className="card h-100"><div className="card-body">
          <h2 className="h5">Vendas por estado</h2>
          {estados.carregando && <Carregando />}
          {estados.erro && <Vazio titulo="Erro" texto={estados.erro.message} />}
          {estados.dados && (
            <table className="table table-sm align-middle mb-0">
              <thead><tr><th scope="col">UF</th><th scope="col">Pedidos</th><th scope="col" className="text-end">Total</th><th scope="col" className="w-50"><span className="visually-hidden">Proporção</span></th></tr></thead>
              <tbody>{estados.dados.rows.map((r) => <tr key={r.state}><th scope="row">{r.state}</th><td>{r.orders}</td><td className="text-end text-nowrap">{moeda(r.totalCents)}</td><td><Barra valor={r.totalCents} max={maxE} /></td></tr>)}</tbody>
            </table>
          )}
        </div></div></div>
        <div className="col-lg-6"><div className="card h-100"><div className="card-body">
          <h2 className="h5">5 clientes que mais compraram</h2>
          {clientes.carregando && <Carregando />}
          {clientes.erro && <Vazio titulo="Erro" texto={clientes.erro.message} />}
          {clientes.dados && (
            <ol className="list-unstyled d-grid gap-3 mb-0">
              {clientes.dados.rows.map((c, i) => (
                <li key={c.id}>
                  <div className="d-flex justify-content-between gap-2"><span><strong>{i + 1}. {c.name}</strong> <span className="small text-body-secondary">{c.state ?? "—"} · {c.orders} pedidos</span></span><strong className="text-nowrap">{moeda(c.totalCents)}</strong></div>
                  <Barra valor={c.totalCents} max={maxC} />
                </li>
              ))}
            </ol>
          )}
        </div></div></div>
      </div>
    </section>
  );
}
/* fim de admin/Relatorios */
