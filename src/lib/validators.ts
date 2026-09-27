/*
 * validators.ts · Validações e máscaras do checkout (exercício 12):
 * cartão (Luhn), validade, CVV, CEP, telefone, e-mail e campos obrigatórios.
 * As mesmas regras são reaplicadas na API.
 */
export const soDigitos = (v: string) => v.replace(/\D/g, "");

/* Algoritmo de Luhn para 13 a 19 dígitos. */
export function cartaoValido(numero: string) {
  const d = soDigitos(numero);
  if (d.length < 13 || d.length > 19) return false;
  let soma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
  }
  return soma % 10 === 0;
}

/* Validade MM/AA ainda não vencida. */
export function validadeOk(mmaa: string, hoje = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmaa.trim());
  if (!m) return false;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12) return false;
  return new Date(2000 + Number(m[2]), mes, 1) > new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const telefoneOk = (v: string) => /^[1-9]{2}(9\d{8}|[2-8]\d{7})$/.test(soDigitos(v));
export const cepOk = (v: string) => /^\d{8}$/.test(soDigitos(v));
export const cvvOk = (v: string) => /^\d{3,4}$/.test(v);

/* Identifica a bandeira pelo prefixo (apenas para exibição). */
export function bandeira(numero: string) {
  const d = soDigitos(numero);
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(606282|3841)/.test(d)) return "Hipercard";
  if (/^(4011|4312|4389|4514|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(d)) return "Elo";
  return "";
}

export const mascaras = {
  /* 0000 0000 0000 0000 (Amex: 0000 000000 00000). */
  cartao(v: string) {
    const d = soDigitos(v).slice(0, 19);
    if (/^3[47]/.test(d)) return d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
    return d.replace(/(\d{4})(?=\d)/g, "$1 ");
  },
  /* MM/AA. */
  validade(v: string) {
    const d = soDigitos(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  /* 00000-000. */
  cep(v: string) {
    const d = soDigitos(v).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },
  /* (00) 00000-0000 ou (00) 0000-0000. */
  telefone(v: string) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },
  cvv: (v: string) => soDigitos(v).slice(0, 4),
  uf: (v: string) => v.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase(),
};

export type DadosCheckout = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cartao: string;
  titular: string;
  validade: string;
  cvv: string;
};

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

/* Valida todos os campos do checkout e devolve campo → mensagem. */
export function validarCheckout(d: DadosCheckout, hoje = new Date()) {
  const erros: Partial<Record<keyof DadosCheckout, string>> = {};
  const obrigatorio = "Campo obrigatório.";
  (Object.keys(d) as (keyof DadosCheckout)[]).forEach((k) => {
    if (!d[k].trim()) erros[k] = obrigatorio;
  });
  if (!erros.nome && !/\S+\s+\S+/.test(d.nome.trim())) erros.nome = "Informe nome e sobrenome.";
  if (!erros.email && !emailOk(d.email)) erros.email = "Use um e-mail como nome@dominio.com.";
  if (!erros.telefone && !telefoneOk(d.telefone)) erros.telefone = "Use um telefone com DDD, como (32) 98836-7667.";
  if (!erros.cep && !cepOk(d.cep)) erros.cep = "O CEP tem 8 dígitos, como 36010-000.";
  if (!erros.uf && !UFS.includes(d.uf.toUpperCase())) erros.uf = "Use a sigla do estado, como MG.";
  if (!erros.cartao && !cartaoValido(d.cartao)) erros.cartao = "Número de cartão inválido. Confira os dígitos.";
  if (!erros.titular && d.titular.trim().length < 3) erros.titular = "Informe o nome como está no cartão.";
  if (!erros.validade && !validadeOk(d.validade, hoje)) erros.validade = "Use MM/AA com data futura.";
  if (!erros.cvv && !cvvOk(d.cvv)) erros.cvv = "O CVV tem 3 ou 4 dígitos.";
  return erros;
}
/* fim de validators.ts */
