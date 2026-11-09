/*
 * esperarDestaque.ts · Segura a montagem do React até a imagem do destaque do
 * esqueleto (index.html) contar como LCP. Se o React troca o esqueleto antes,
 * a imagem sai da tela sem virar LCP, e o LCP passa a ser a imagem que o React
 * desenha depois do JavaScript (#15). Esperar só o "load" e alguns quadros não
 * basta: no Lighthouse a primeira pintura vem bem depois. Por isso a espera
 * acaba quando o navegador registra o LCP da própria imagem.
 * Nunca segura além do limite; desiste pouco depois do "load" se a imagem não
 * for o maior elemento; sem esqueleto, com a aba oculta, sem suporte ou com a
 * imagem quebrada, não espera.
 */
export const LIMITE_MS = 2500;
/* Depois do load, da decodificação e de dois quadros: sem entrada de LCP até lá, não haverá. */
export const FOLGA_MS = 1000;

export type Motivo = "sem-esqueleto" | "oculta" | "sem-suporte" | "erro" | "lcp" | "apos-load" | "limite";

type Opcoes = { doc?: Document; win?: Window & typeof globalThis; limite?: number; folga?: number };

/* Resolve com o motivo do fim da espera. */
export function esperarDestaque({ doc = document, win = window, limite = LIMITE_MS, folga = FOLGA_MS }: Opcoes = {}): Promise<Motivo> {
  const img = doc.querySelector<HTMLImageElement>("#app-shell img");
  if (!img || doc.documentElement.classList.contains("no-shell")) return Promise.resolve("sem-esqueleto");
  const Observer = win.PerformanceObserver;
  if (typeof Observer !== "function" || !Observer.supportedEntryTypes?.includes("largest-contentful-paint")) return Promise.resolve("sem-suporte");
  if (doc.visibilityState === "hidden") return Promise.resolve("oculta");
  if (img.complete && img.naturalWidth === 0) return Promise.resolve("erro");

  return new Promise((resolve) => {
    let feito = false;
    let observer: PerformanceObserver | undefined;
    const timers: number[] = [];
    const fim = (motivo: Motivo) => {
      if (feito) return;
      feito = true;
      timers.forEach((id) => win.clearTimeout(id));
      observer?.disconnect();
      resolve(motivo);
    };
    const depoisDoQuadro = (fn: () => void) => (typeof win.requestAnimationFrame === "function" ? win.requestAnimationFrame(() => win.requestAnimationFrame(fn)) : fn());
    const aposLoad = () => {
      const decodificada = typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve();
      decodificada.then(() => depoisDoQuadro(() => !feito && timers.push(win.setTimeout(() => fim("apos-load"), folga))));
    };
    try {
      timers.push(win.setTimeout(() => fim("limite"), limite));
      img.addEventListener("error", () => fim("erro"), { once: true });
      if (img.complete) aposLoad();
      else img.addEventListener("load", aposLoad, { once: true });
      observer = new Observer((lista) => {
        if (lista.getEntries().some((e) => (e as PerformanceEntry & { element?: Element }).element === img)) fim("lcp");
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      fim("erro");
    }
  });
}
/* fim de esperarDestaque.ts */
