/*
 * client.ts · Cliente HTTP da API e tipos compartilhados do front.
 * Usa cookies (credentials: include) e converte respostas de erro em
 * ApiError com a lista de campos inválidos.
 */
export type TipoFone = "over-ear" | "on-ear" | "in-ear" | "gamer";
export type Conexao = "bluetooth" | "cabo" | "2.4ghz";

export type Produto = {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string;
  type: TipoFone;
  connection: Conexao;
  color: string;
  stock: number;
  active: boolean;
};

export type Pagina<T> = { items: T[]; total: number; page: number; perPage: number; pages: number };
export type Usuario = { id: number; name: string; email: string; role: "customer" | "admin" };
export type ItemPedido = { id: number; productId: number; name: string; quantity: number; unitPriceCents: number; totalCents: number; product: { slug: string; imageUrl: string; active: boolean } | null };
export type Pedido = {
  id: number;
  userId: number;
  status: "pago" | "enviado" | "entregue" | "cancelado";
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customerName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  cardLast4: string;
  createdAt: string;
  items: ItemPedido[];
};
export type LinhaCotacao = { productId: number; quantity: number; product: Pick<Produto, "id" | "name" | "slug" | "imageUrl" | "priceCents" | "stock" | "active"> | null; totalCents: number; problema: "indisponivel" | "estoque" | null };
export type Cotacao = { linhas: LinhaCotacao[]; subtotalCents: number; shippingCents: number; totalCents: number };

export const TIPOS: Record<TipoFone, string> = { "over-ear": "Over-ear", "on-ear": "On-ear", "in-ear": "In-ear", gamer: "Gamer" };
export const CONEXOES: Record<Conexao, string> = { bluetooth: "Bluetooth", cabo: "Com fio", "2.4ghz": "Sem fio 2.4 GHz" };

export class ApiError extends Error {
  status: number;
  details: { campo?: string; mensagem?: string; productId?: number; problema?: string; disponivel?: number }[];

  /* Erro de API com status e detalhes por campo. */
  constructor(status: number, message: string, details: ApiError["details"] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /* Converte os detalhes em um mapa campo → mensagem. */
  campos() {
    return Object.fromEntries(this.details.filter((d) => d.campo).map((d) => [d.campo!, d.mensagem ?? ""]));
  }
}

/* Faz a requisição e devolve o JSON (ou lança ApiError). */
export async function api<T>(caminho: string, opcoes: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...resto } = opcoes;
  let resp: Response;
  try {
    resp = await fetch(`/api${caminho}`, {
      credentials: "include",
      headers: json !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
      body: json !== undefined ? JSON.stringify(json) : resto.body,
      ...resto,
    });
  } catch {
    throw new ApiError(0, "Sem conexão com o servidor. Verifique se a API está rodando.");
  }
  if (resp.status === 204) return undefined as T;
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new ApiError(resp.status, dados.error ?? "Erro inesperado.", dados.details ?? []);
  return dados as T;
}
/* fim de client.ts */
