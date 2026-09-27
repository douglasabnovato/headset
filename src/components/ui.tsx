/*
 * ui.tsx · Peças pequenas de interface: carregando, estado vazio, campo de
 * formulário com erro acessível, seletor de quantidade e rota protegida.
 */
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Indicador de carregamento anunciado ao leitor de tela. */
export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="carregando" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" /> <span>{texto}</span>
    </div>
  );
}

/* Estado vazio com ação opcional. */
export function Vazio({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="vazio" role="status">
      <span className="vazio__icone" aria-hidden="true">🎧</span>
      <h2 className="h5">{titulo}</h2>
      {texto && <p className="text-body-secondary">{texto}</p>}
      {acao}
    </div>
  );
}

type CampoProps = InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; ajuda?: string; carregando?: boolean; nome: string };

/* Campo com rótulo, ajuda e mensagem de erro ligadas por aria-describedby. */
export function Campo({ rotulo, erro, ajuda, carregando, nome, className = "", ...resto }: CampoProps) {
  const id = useId();
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id} className="form-label">{rotulo}</label>
      <div className="position-relative">
        <input id={id} name={nome} className={`form-control ${erro ? "is-invalid" : ""}`} aria-invalid={!!erro} aria-describedby={[erro ? idErro : "", ajuda ? idAjuda : ""].filter(Boolean).join(" ") || undefined} aria-busy={carregando || undefined} {...resto} />
        {carregando && <span className="spinner-border spinner-border-sm campo__giro" role="status"><span className="visually-hidden">Buscando…</span></span>}
      </div>
      {ajuda && !erro && <div id={idAjuda} className="form-text">{ajuda}</div>}
      {erro && <div id={idErro} className="invalid-feedback d-block">{erro}</div>}
    </div>
  );
}

/* Seletor de quantidade com limites. */
export function Quantidade({ valor, max, onChange, rotulo }: { valor: number; max: number; onChange: (n: number) => void; rotulo: string }) {
  const id = useId();
  return (
    <div className="quantidade input-group input-group-sm" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(valor - 1)} disabled={valor <= 1} aria-label={`Diminuir quantidade de ${rotulo}`}>−</button>
      <label htmlFor={id} className="visually-hidden">Quantidade de {rotulo}</label>
      <input id={id} className="form-control text-center" type="number" inputMode="numeric" min={1} max={max} value={valor} onChange={(e) => { const n = Number(e.target.value); if (n >= 1) onChange(Math.min(n, max)); }} />
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(valor + 1)} disabled={valor >= max} aria-label={`Aumentar quantidade de ${rotulo}`}>+</button>
    </div>
  );
}

/* Protege rotas que exigem login (ou papel de admin). */
export function Protegida({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, carregando } = useAuth();
  const local = useLocation();
  if (carregando) return <Carregando texto="Verificando sua sessão…" />;
  if (!user) return <Navigate to={`/entrar?voltar=${encodeURIComponent(local.pathname + local.search)}`} replace />;
  if (admin && user.role !== "admin") return <Vazio titulo="Acesso restrito" texto="Esta área é só para administradores." acao={<Link to="/" className="btn btn-primary">Voltar à loja</Link>} />;
  return <>{children}</>;
}
/* fim de ui.tsx */
