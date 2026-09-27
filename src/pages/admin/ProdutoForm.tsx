/*
 * admin/ProdutoForm · Criação e edição de produto (exercício 10): nome,
 * descrição, preço, imagem (upload com prévia ou URL), tipo, conexão, cor,
 * estoque e status, com erros por campo vindos da API.
 */
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError, CONEXOES, TIPOS, type Produto } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Campo, Carregando } from "../../components/ui";

type Form = { name: string; description: string; price: string; compareAt: string; type: string; connection: string; color: string; stock: string; active: boolean; imageUrl: string };
const VAZIO: Form = { name: "", description: "", price: "", compareAt: "", type: "", connection: "", color: "", stock: "0", active: true, imageUrl: "" };

/* Converte centavos em "1299,00" para o campo de preço. */
const paraCampo = (c: number | null) => (c ? (c / 100).toFixed(2).replace(".", ",") : "");

/* Formulário de produto. */
export default function ProdutoForm() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const avisar = useToast();
  const [f, setF] = useState<Form>(VAZIO);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [geral, setGeral] = useState("");
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    document.title = `${editando ? "Editar" : "Novo"} produto · Admin · Headset Store`;
    if (!editando) return;
    api<{ product: Produto }>(`/products/${id}`)
      .then(({ product: p }) => {
        setF({ name: p.name, description: p.description, price: paraCampo(p.priceCents), compareAt: paraCampo(p.compareAtCents), type: p.type, connection: p.connection, color: p.color, stock: String(p.stock), active: p.active, imageUrl: p.imageUrl });
        setPrevia(p.imageUrl);
      })
      .catch((e) => setGeral(e.message))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  /* Atualiza um campo de texto. */
  const campo = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setF({ ...f, [k]: e.target.value });
    if (erros[k]) setErros({ ...erros, [k]: "" });
  };

  /* Valida tipo e tamanho da imagem escolhida e mostra a prévia. */
  const escolherArquivo = (e: ChangeEvent<HTMLInputElement>) => {
    const a = e.target.files?.[0] ?? null;
    if (a && !["image/png", "image/jpeg", "image/webp"].includes(a.type)) {
      setErros({ ...erros, image: "Envie uma imagem PNG, JPG ou WebP." });
      e.target.value = "";
      return;
    }
    if (a && a.size > 2 * 1024 * 1024) {
      setErros({ ...erros, image: "A imagem deve ter no máximo 2 MB." });
      e.target.value = "";
      return;
    }
    setErros({ ...erros, image: "" });
    setArquivo(a);
    setPrevia(a ? URL.createObjectURL(a) : f.imageUrl);
  };

  /* Envia como multipart (com arquivo) para criar ou atualizar. */
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setGeral("");
    const corpo = new FormData();
    Object.entries(f).forEach(([k, v]) => corpo.append(k, String(v)));
    if (arquivo) corpo.append("image", arquivo);
    setSalvando(true);
    try {
      const r = await api<{ product: Produto }>(editando ? `/products/${id}` : "/products", { method: editando ? "PUT" : "POST", body: corpo });
      avisar(`${r.product.name} ${editando ? "atualizado" : "criado"} com sucesso.`);
      navegar("/admin/produtos");
    } catch (err) {
      if (err instanceof ApiError) {
        setErros(err.campos());
        setGeral(err.message);
        requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      } else setGeral("Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Carregando texto="Carregando produto…" />;

  return (
    <section aria-labelledby="form-titulo" className="mx-auto" style={{ maxWidth: 860 }}>
      <Link to="/admin/produtos" className="d-inline-block mb-2">← Produtos</Link>
      <h1 id="form-titulo" className="h3 mb-3">{editando ? "Editar produto" : "Novo produto"}</h1>
      {geral && <div className="alert alert-danger" role="alert">{geral}</div>}
      <form onSubmit={salvar} noValidate className="card"><div className="card-body row g-3">
        <Campo className="col-md-8" nome="name" rotulo="Nome" value={f.name} onChange={campo("name")} erro={erros.name} required />
        <Campo className="col-md-4" nome="color" rotulo="Cor" value={f.color} onChange={campo("color")} erro={erros.color} required />
        <div className="col-12">
          <label htmlFor="descricao" className="form-label">Descrição</label>
          <textarea id="descricao" name="description" className={`form-control ${erros.description ? "is-invalid" : ""}`} rows={4} value={f.description} onChange={campo("description")} aria-invalid={!!erros.description} aria-describedby={erros.description ? "descricao-erro" : undefined} required />
          {erros.description && <div id="descricao-erro" className="invalid-feedback d-block">{erros.description}</div>}
        </div>
        <Campo className="col-md-4" nome="price" rotulo="Preço (R$)" inputMode="decimal" placeholder="1299,00" value={f.price} onChange={campo("price")} erro={erros.price} required />
        <Campo className="col-md-4" nome="compareAt" rotulo="Preço 'de' (opcional)" inputMode="decimal" placeholder="1599,00" value={f.compareAt} onChange={campo("compareAt")} erro={erros.compareAt} />
        <Campo className="col-md-4" nome="stock" rotulo="Estoque" type="number" min={0} value={f.stock} onChange={campo("stock")} erro={erros.stock} required />
        {(["type", "connection"] as const).map((k) => (
          <div className="col-md-6" key={k}>
            <label htmlFor={`sel-${k}`} className="form-label">{k === "type" ? "Tipo" : "Conexão"}</label>
            <select id={`sel-${k}`} name={k} className={`form-select ${erros[k] ? "is-invalid" : ""}`} value={f[k]} onChange={campo(k)} aria-invalid={!!erros[k]} required>
              <option value="">Escolha…</option>
              {Object.entries(k === "type" ? TIPOS : CONEXOES).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
            {erros[k] && <div className="invalid-feedback d-block">{erros[k]}</div>}
          </div>
        ))}
        <fieldset className="col-12">
          <legend className="form-label fs-6">Imagem</legend>
          <div className="d-flex flex-wrap gap-3 align-items-start">
            <div className="previa">{previa ? <img src={previa} alt="Prévia da imagem do produto" width={120} height={120} /> : <span className="small text-body-secondary">Sem imagem</span>}</div>
            <div className="flex-grow-1 d-grid gap-2">
              <div>
                <label htmlFor="arquivo" className="form-label small mb-1">Enviar arquivo (PNG, JPG ou WebP até 2 MB)</label>
                <input id="arquivo" name="image" type="file" accept="image/png,image/jpeg,image/webp" className={`form-control ${erros.image ? "is-invalid" : ""}`} onChange={escolherArquivo} aria-invalid={!!erros.image} aria-describedby={erros.image ? "arquivo-erro" : undefined} />
                {erros.image && <div id="arquivo-erro" className="invalid-feedback d-block">{erros.image}</div>}
              </div>
              <Campo nome="imageUrl" rotulo="…ou URL da imagem" placeholder="/produtos/meu-fone.svg ou https://…" value={f.imageUrl} onChange={(e) => { campo("imageUrl")(e); if (!arquivo) setPrevia(e.target.value); }} erro={erros.imageUrl} />
            </div>
          </div>
        </fieldset>
        <div className="col-12 form-check form-switch ms-2">
          <input id="ativo" className="form-check-input" type="checkbox" role="switch" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
          <label htmlFor="ativo" className="form-check-label">Produto ativo (visível na loja)</label>
        </div>
        <div className="col-12 d-flex gap-2 justify-content-end">
          <Link to="/admin/produtos" className="btn btn-outline-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={salvando}>{salvando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}{editando ? "Salvar alterações" : "Criar produto"}</button>
        </div>
      </div></form>
    </section>
  );
}
/* fim de admin/ProdutoForm */
