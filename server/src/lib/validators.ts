/*
 * validators.ts · Regras de formato compartilhadas com o checkout:
 * Luhn para cartão, validade MM/AA não vencida, telefone com DDD e CEP.
 */

/* Verifica o número do cartão pelo algoritmo de Luhn (13 a 19 dígitos). */
export function cartaoValido(numero: string) {
  const d = numero.replace(/\D/g, "");
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

/* Confere validade MM/AA ainda não vencida (vale até o fim do mês). */
export function validadeOk(mmaa: string, hoje = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmaa.trim());
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  return new Date(ano, mes, 1) > new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

/* Telefone brasileiro com DDD: 10 ou 11 dígitos, DDD válido. */
export function telefoneOk(tel: string) {
  return /^[1-9]{2}(9\d{8}|[2-8]\d{7})$/.test(tel.replace(/\D/g, ""));
}

/* CEP com 8 dígitos. */
export function cepOk(cep: string) {
  return /^\d{8}$/.test(cep.replace(/\D/g, ""));
}
/* fim de validators.ts */
