/*
 * esperarDestaque.ts · Segura a montagem do React até a imagem do destaque do
 * esqueleto (index.html) pintar. Se o React troca o esqueleto antes, a imagem
 * sai da tela sem virar LCP, e o LCP passa a ser a imagem que o React desenha
 * depois do JavaScript (#15). Nunca segura além do limite; sem esqueleto, com
 * a aba oculta ou com a imagem quebrada, não espera.
 */
export const LIMITE_MS = 2500;

export type Motivo = "sem-esqueleto" | "oculta" | "erro" | "pintou" | "limite";

/* Resolve com o motivo do fim da espera. */
export function esperarDestaque({ doc = document, win = window, limite = LIMITE_MS }: { doc?: Document; win?: Window; limite?: number } = {}): Promise<Motivo> {
  const img = doc.querySelector<HTMLImageElement>("#app-shell img");
  if (!img || doc.documentElement.classList.contains("no-shell")) return Promise.resolve("sem-esqueleto");
  if (doc.visibilityState === "hidden") return Promise.resolve("oculta");
  if (img.complete && img.naturalWidth === 0) return Promise.resolve("erro");

  return new Promise((resolve) => {
    let feito = false;
    const fim = (motivo: Motivo) => {
      if (feito) return;
      feito = true;
      resolve(motivo);
    };
    win.setTimeout(() => fim("limite"), limite);
    /* Decodificada e com um quadro depois: a imagem já está na tela. */
    const pintar = () => {
      const decodificada = typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve();
      decodificada.then(() => {
        if (typeof win.requestAnimationFrame !== "function") return fim("pintou");
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => fim("pintou")));
      });
    };
    img.addEventListener("error", () => fim("erro"), { once: true });
    if (img.complete) pintar();
    else img.addEventListener("load", pintar, { once: true });
  });
}
/* fim de esperarDestaque.ts */
