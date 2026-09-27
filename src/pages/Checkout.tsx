/*
 * Checkout · Finalização de compra (exercício 12).
 * Todos os campos são obrigatórios e validados no formato (cartão por Luhn,
 * validade, CVV, CEP, e-mail, telefone); o CEP preenche o endereço via
 * cep-promise; há indicadores de carregamento; a quantidade pode ser
 * alterada aqui; no sucesso o objeto final é exibido no console.
 */
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import cep from "cep-promise";
import { api, ApiError, type Pedido } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useCotacao } from "../hooks/useCotacao";
import CartList, { Resumo } from "../components/CartList";
import { Campo, Vazio } from "../components/ui";
import { bandeira, mascaras, soDigitos, validarCheckout, type DadosCheckout } from "../lib/validators";
import { moeda } from "../lib/format";

type Erros = Partial<Record<keyof DadosCheckout, string>>;
const ORDEM: (keyof DadosCheckout)[] = ["nome", "email", "telefone", "cep", "rua", "numero", "bairro", "cidade", "uf", "cartao", "titular", "validade", "cvv"];
const DO_SERVIDOR: Record<string, keyof DadosCheckout> = {
  "customer.name": "nome", "customer.email": "email", "customer.phone": "telefone", "address.cep": "cep", "address.street": "rua", "address.number": "numero",
  "address.district": "bairro", "address.city": "cidade", "address.state": "uf", "payment.cardNumber": "cartao", "payment.holder": "titular", "payment.expiry": "validade", "payment.cvv": "cvv",
};

/* Página de finalização de compra. */
export default function Checkout() {
  const { user } = useAuth();
  const { itens, esvaziar } = useCart();
  const { cotacao, carregando: cotando } = useCotacao();
  const avisar = useToast();
  const [dados, setDados] = useState<DadosCheckout>({ nome: user?.name ?? "", email: user?.email ?? "", telefone: "", cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "", cartao: "", titular: "", validade: "", cvv: "" });
  const [erros, setErros] = useState<Erros>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [concluido, setConcluido] = useState<Pedido | null>(null);
  const ultimoCep = useRef("");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    document.title = "Finalizar compra · Headset Store";
  }, []);

  /* Atualiza um campo aplicando a máscara e limpando o erro dele. */
  const mudar = (campo: keyof DadosCheckout, mascara?: (v: string) => string) => (e: ChangeEvent<HTMLInputElement>) => {
    const valor = mascara ? mascara(e.target.value) : e.target.value;
    setDados((d) => ({ ...d, [campo]: valor }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
    if (campo === "cep" && soDigitos(valor).length === 8) buscarCep(valor);
  };

  /* Valida um campo ao sair dele (feedback imediato, sem esperar o envio). */
  const aoSair = (campo: keyof DadosCheckout) => () => {
    if (!dados[campo]) return;
    const e = validarCheckout(dados)[campo];
    setErros((x) => ({ ...x, [campo]: e }));
  };

  /* Busca o endereço do CEP com cep-promise e preenche os campos. */
  const buscarCep = async (valor: string) => {
    const d = soDigitos(valor);
    if (d === ultimoCep.current) return;
    ultimoCep.current = d;
    setBuscandoCep(true);
    setAvisoCep("");
    try {
      const r = await cep(d);
      setDados((x) => ({ ...x, rua: r.street || x.rua, bairro: r.neighborhood || x.bairro, cidade: r.city, uf: r.state }));
      setErros((x) => ({ ...x, cep: undefined, rua: undefined, bairro: undefined, cidade: undefined, uf: undefined }));
      setAvisoCep(`Endereço encontrado: ${r.city}/${r.state}.`);
      form.current?.querySelector<HTMLInputElement>('[name="numero"]')?.focus();
    } catch (e: unknown) {
      const falhas = ((e as { errors?: { message?: string }[] })?.errors ?? []).map((x) => x.message ?? "").join(" ").toLowerCase();
      const naoExiste = /encontrad|inexistente|not found/.test(falhas);
      setErros((x) => ({ ...x, cep: naoExiste ? "CEP não encontrado. Confira os números ou preencha o endereço." : undefined }));
      if (!naoExiste) setAvisoCep("Serviço de CEP indisponível agora. Preencha o endereço manualmente.");
      form.current?.querySelector<HTMLInputElement>('[name="rua"]')?.focus();
    } finally {
      setBuscandoCep(false);
    }
  };

  /* Valida tudo, envia o pedido e mostra o resultado. */
  const finalizar = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral("");
    const encontrados = validarCheckout(dados);
    setErros(encontrados);
    const primeiro = ORDEM.find((k) => encontrados[k]);
    if (primeiro) {
      form.current?.querySelector<HTMLInputElement>(`[name="${primeiro}"]`)?.focus();
      setErroGeral(`Revise ${Object.keys(encontrados).length === 1 ? "o campo destacado" : `os ${Object.keys(encontrados).length} campos destacados`} para concluir.`);
      return;
    }
    if (cotacao?.linhas.some((l) => l.problema)) {
      setErroGeral("Há itens sem estoque suficiente. Ajuste o carrinho.");
      return;
    }
    const objeto = {
      items: itens.map((i) => ({ productId: i.produto.id, quantity: i.quantidade })),
      customer: { name: dados.nome.trim(), email: dados.email.trim(), phone: dados.telefone },
      address: { cep: dados.cep, street: dados.rua.trim(), number: dados.numero.trim(), district: dados.bairro.trim(), city: dados.cidade.trim(), state: dados.uf.toUpperCase() },
      payment: { cardNumber: dados.cartao, holder: dados.titular.trim(), expiry: dados.validade, cvv: dados.cvv },
    };
    setEnviando(true);
    try {
      const r = await api<{ order: Pedido }>("/orders", { method: "POST", json: objeto });
      console.log("Pedido finalizado", {
        ...objeto,
        payment: { ...objeto.payment, cardNumber: `**** **** **** ${soDigitos(dados.cartao).slice(-4)}`, cvv: "***" },
        resumo: { subtotal: cotacao?.subtotalCents, frete: cotacao?.shippingCents, total: r.order.totalCents },
        pedido: r.order,
      });
      setConcluido(r.order);
      esvaziar();
      avisar(`Pedido #${r.order.id} confirmado!`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        const campos = err.campos();
        const mapeados: Erros = {};
        Object.entries(campos).forEach(([k, v]) => { if (DO_SERVIDOR[k]) mapeados[DO_SERVIDOR[k]] = v; });
        setErros(mapeados);
        setErroGeral(err.message);
      } else setErroGeral("Não foi possível finalizar agora. Tente novamente.");
      avisar("Pedido não concluído.", "erro");
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <section className="sucesso-pedido card" aria-labelledby="sucesso-titulo">
        <div className="card-body text-center py-5">
          <span className="sucesso-pedido__marca" aria-hidden="true">✓</span>
          <h1 id="sucesso-titulo" className="h3" tabIndex={-1} ref={(h) => h?.focus()}>Pedido #{concluido.id} confirmado!</h1>
          <p>Enviamos a confirmação para <strong>{concluido.email}</strong>. Total pago: <strong>{moeda(concluido.totalCents)}</strong> no cartão final {concluido.cardLast4}.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link className="btn btn-primary" to={`/pedidos/${concluido.id}`}>Ver detalhes do pedido</Link>
            <Link className="btn btn-outline-primary" to="/">Continuar comprando</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!itens.length) return <Vazio titulo="Seu carrinho está vazio" texto="Adicione um headphone para finalizar a compra." acao={<Link to="/" className="btn btn-primary">Ver catálogo</Link>} />;

  const band = bandeira(dados.cartao);

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <h1 className="h3 mb-3">Finalizar compra</h1>
        {erroGeral && <div className="alert alert-danger" role="alert">{erroGeral}</div>}
        <form ref={form} onSubmit={finalizar} noValidate aria-describedby="obrigatorios">
          <p id="obrigatorios" className="small text-body-secondary">Todos os campos são obrigatórios.</p>
          <fieldset className="card mb-3"><div className="card-body">
            <legend className="h5">1. Seus dados</legend>
            <div className="row g-3">
              <Campo className="col-12" nome="nome" rotulo="Nome completo" autoComplete="name" value={dados.nome} onChange={mudar("nome")} onBlur={aoSair("nome")} erro={erros.nome} />
              <Campo className="col-md-7" nome="email" rotulo="E-mail" type="email" autoComplete="email" value={dados.email} onChange={mudar("email")} onBlur={aoSair("email")} erro={erros.email} />
              <Campo className="col-md-5" nome="telefone" rotulo="Telefone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(32) 98836-7667" value={dados.telefone} onChange={mudar("telefone", mascaras.telefone)} onBlur={aoSair("telefone")} erro={erros.telefone} />
            </div>
          </div></fieldset>

          <fieldset className="card mb-3"><div className="card-body">
            <legend className="h5">2. Entrega</legend>
            <div className="row g-3">
              <Campo className="col-md-4" nome="cep" rotulo="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={dados.cep} onChange={mudar("cep", mascaras.cep)} onBlur={aoSair("cep")} erro={erros.cep} carregando={buscandoCep} ajuda={buscandoCep ? "Buscando endereço…" : avisoCep || "Digite o CEP para preencher o endereço."} />
              <div className="col-md-8 d-flex align-items-end"><a className="small mb-2" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener">Não sei meu CEP</a></div>
              <Campo className="col-md-9" nome="rua" rotulo="Rua" autoComplete="address-line1" value={dados.rua} onChange={mudar("rua")} onBlur={aoSair("rua")} erro={erros.rua} disabled={buscandoCep} />
              <Campo className="col-md-3" nome="numero" rotulo="Número" autoComplete="address-line2" value={dados.numero} onChange={mudar("numero")} onBlur={aoSair("numero")} erro={erros.numero} />
              <Campo className="col-md-5" nome="bairro" rotulo="Bairro" value={dados.bairro} onChange={mudar("bairro")} onBlur={aoSair("bairro")} erro={erros.bairro} disabled={buscandoCep} />
              <Campo className="col-md-5" nome="cidade" rotulo="Cidade" autoComplete="address-level2" value={dados.cidade} onChange={mudar("cidade")} onBlur={aoSair("cidade")} erro={erros.cidade} disabled={buscandoCep} />
              <Campo className="col-md-2" nome="uf" rotulo="UF" autoComplete="address-level1" value={dados.uf} onChange={mudar("uf", mascaras.uf)} onBlur={aoSair("uf")} erro={erros.uf} disabled={buscandoCep} />
            </div>
          </div></fieldset>

          <fieldset className="card mb-3"><div className="card-body">
            <legend className="h5">3. Pagamento <span className="badge text-bg-secondary fw-normal">simulado</span></legend>
            <div className="row g-3">
              <Campo className="col-12" nome="cartao" rotulo={`Número do cartão${band ? ` · ${band}` : ""}`} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={dados.cartao} onChange={mudar("cartao", mascaras.cartao)} onBlur={aoSair("cartao")} erro={erros.cartao} ajuda="Para testar: 4111 1111 1111 1111." />
              <Campo className="col-12" nome="titular" rotulo="Nome impresso no cartão" autoComplete="cc-name" value={dados.titular} onChange={mudar("titular", (v) => v.toUpperCase())} onBlur={aoSair("titular")} erro={erros.titular} />
              <Campo className="col-6" nome="validade" rotulo="Validade (MM/AA)" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={dados.validade} onChange={mudar("validade", mascaras.validade)} onBlur={aoSair("validade")} erro={erros.validade} />
              <Campo className="col-6" nome="cvv" rotulo="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={dados.cvv} onChange={mudar("cvv", mascaras.cvv)} onBlur={aoSair("cvv")} erro={erros.cvv} />
            </div>
          </div></fieldset>

          <button type="submit" className="btn btn-game btn-lg w-100" disabled={enviando || cotando}>
            {enviando ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Processando pagamento…</> : `Fechar pedido${cotacao ? ` · ${moeda(cotacao.totalCents)}` : ""}`}
          </button>
          <p className="visually-hidden" role="status">{enviando ? "Processando pagamento" : ""}</p>
        </form>
      </div>
      <aside className="col-lg-5" aria-labelledby="sacola-titulo">
        <div className="card resumo-card sticky-lg-top">
          <div className="card-body">
            <h2 id="sacola-titulo" className="h5">Sua sacola</h2>
            <CartList cotacao={cotacao} compacta />
            <hr />
            <Resumo cotacao={cotacao} carregando={cotando} />
          </div>
        </div>
      </aside>
    </div>
  );
}
/* fim de Checkout */
