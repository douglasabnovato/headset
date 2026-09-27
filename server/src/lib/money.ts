/*
 * money.ts · Utilitários de valores e texto: frete, slug e máscara de cartão.
 */
import { config } from "../config.js";

/* Frete fixo, grátis a partir do valor configurado. */
export function calcularFrete(subtotalCents: number) {
  return subtotalCents === 0 || subtotalCents >= config.freteGratisAPartirCents ? 0 : config.freteCents;
}

/* Gera um slug amigável para URL a partir do nome. */
export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
/* fim de money.ts */
