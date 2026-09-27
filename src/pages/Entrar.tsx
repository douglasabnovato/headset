/*
 * Entrar · Login e cadastro na mesma tela (abas), com validação por campo,
 * mensagens da API e retorno para a página de origem (?voltar=).
 */
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Campo } from "../components/ui";
import { emailOk } from "../lib/validators";

/* Página de login/cadastro. */
export default function Entrar({ modo = "entrar" }: { modo?: "entrar" | "cadastro" }) {
  const { entrar, cadastrar, user } = useAuth();
  const avisar = useToast();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const voltar = params.get("voltar") || "/";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [geral, setGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cadastro = modo === "cadastro";

  useEffect(() => {
    document.title = `${cadastro ? "Criar conta" : "Entrar"} · Headset Store`;
    setErros({});
    setGeral("");
  }, [cadastro]);

  useEffect(() => {
    if (user) navegar(voltar, { replace: true });
  }, [user, navegar, voltar]);

  /* Valida localmente e envia para a API. */
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (cadastro && f.name.trim().length < 3) x.name = "Informe o nome completo.";
    if (!emailOk(f.email)) x.email = "Informe um e-mail válido.";
    if (!f.password) x.password = "Informe a senha.";
    else if (cadastro && (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))) x.password = "Use 8 caracteres ou mais, com letra e número.";
    setErros(x);
    setGeral("");
    if (Object.keys(x).length) return;
    setEnviando(true);
    try {
      const u = cadastro ? await cadastrar(f.name, f.email, f.password) : await entrar(f.email, f.password);
      avisar(cadastro ? `Conta criada. Bem-vindo(a), ${u.name.split(" ")[0]}!` : `Olá, ${u.name.split(" ")[0]}!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErros(err.campos());
        setGeral(err.message);
      } else setGeral("Não foi possível entrar agora.");
    } finally {
      setEnviando(false);
    }
  };

  const sufixo = params.get("voltar") ? `?voltar=${encodeURIComponent(voltar)}` : "";
  return (
    <section className="auth card mx-auto" aria-labelledby="auth-titulo">
      <div className="card-body p-4">
        <h1 id="auth-titulo" className="h3 mb-1">{cadastro ? "Criar conta" : "Entrar"}</h1>
        <p className="text-body-secondary">{cadastro ? "Leva menos de um minuto." : "Acesse seus pedidos e finalize compras."}</p>
        {voltar === "/checkout" && <div className="alert alert-info py-2">Entre para finalizar sua compra. Seu carrinho está salvo.</div>}
        {geral && <div className="alert alert-danger py-2" role="alert">{geral}</div>}
        <form onSubmit={enviar} noValidate className="d-grid gap-3">
          {cadastro && <Campo nome="name" rotulo="Nome completo" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} erro={erros.name} />}
          <Campo nome="email" rotulo="E-mail" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} erro={erros.email} />
          <Campo nome="password" rotulo="Senha" type="password" autoComplete={cadastro ? "new-password" : "current-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} erro={erros.password} ajuda={cadastro ? "Mínimo de 8 caracteres, com letra e número." : undefined} />
          <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
            {enviando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>
        <p className="mt-3 mb-0 text-center">
          {cadastro ? <>Já tem conta? <Link to={`/entrar${sufixo}`}>Entrar</Link></> : <>Ainda não tem conta? <Link to={`/cadastro${sufixo}`}>Criar conta</Link></>}
        </p>
        {!cadastro && <p className="small text-body-secondary mt-3 mb-0 text-center">Demonstração: cliente@headset.dev / Cliente@123 · admin@headset.dev / Admin@123</p>}
      </div>
    </section>
  );
}
/* fim de Entrar */
