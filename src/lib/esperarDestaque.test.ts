/*
 * esperarDestaque.test.ts · Espera do esqueleto antes de montar o React (#15).
 */
import { afterEach, describe, expect, it } from "vitest";
import { esperarDestaque } from "./esperarDestaque";

type Cb = (lista: { getEntries: () => { element: Element | null }[] }) => void;

/* PerformanceObserver falso: o teste dispara as entradas de LCP com emitir(). */
function criarWin({ suporta = true } = {}) {
  const callbacks: Cb[] = [];
  const quadros: (() => void)[] = [];
  function FakeObserver(this: unknown, cb: Cb) {
    callbacks.push(cb);
  }
  FakeObserver.prototype.observe = () => undefined;
  FakeObserver.prototype.disconnect = () => undefined;
  (FakeObserver as unknown as { supportedEntryTypes: string[] }).supportedEntryTypes = suporta ? ["largest-contentful-paint"] : ["paint"];
  const win = {
    PerformanceObserver: FakeObserver,
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
    clearTimeout: (id: number) => clearTimeout(id),
    requestAnimationFrame: (fn: () => void) => quadros.push(fn),
  } as unknown as Window & typeof globalThis;
  const emitir = (element: Element | null) => callbacks.forEach((cb) => cb({ getEntries: () => [{ element }] }));
  return { win, emitir, quadros };
}

function montar(comImagem = true) {
  document.documentElement.className = "";
  document.body.innerHTML = comImagem ? '<p>marca</p><div id="app-shell"><img src="/produtos/kitty-quartz.png" alt="" /></div>' : '<div id="app-shell"></div>';
  const img = document.querySelector("img");
  if (img) Object.defineProperty(img, "complete", { value: false, configurable: true });
  return img as HTMLImageElement;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.className = "";
});

describe("esperarDestaque", () => {
  it("sem esqueleto, fora da vitrine ou sem suporte, não espera", async () => {
    montar(false);
    await expect(esperarDestaque({ win: criarWin().win })).resolves.toBe("sem-esqueleto");
    montar();
    document.documentElement.className = "no-shell";
    await expect(esperarDestaque({ win: criarWin().win })).resolves.toBe("sem-esqueleto");
    montar();
    await expect(esperarDestaque({ win: criarWin({ suporta: false }).win })).resolves.toBe("sem-suporte");
  });

  it("libera quando o LCP registra a própria imagem, não outro elemento", async () => {
    montar();
    const { win, emitir } = criarWin();
    let motivo: string | null = null;
    esperarDestaque({ win, limite: 5000 }).then((m) => (motivo = m));
    emitir(document.querySelector("p"));
    await esperar(10);
    expect(motivo).toBeNull();
    emitir(document.querySelector("img"));
    await esperar(10);
    expect(motivo).toBe("lcp");
  });

  it("sem LCP da imagem, desiste depois do load, de dois quadros e da folga", async () => {
    const img = montar();
    const { win, quadros } = criarWin();
    let motivo: string | null = null;
    esperarDestaque({ win, limite: 5000, folga: 10 }).then((m) => (motivo = m));
    img.dispatchEvent(new Event("load"));
    await esperar(30);
    expect(motivo).toBeNull();
    quadros.shift()?.();
    quadros.shift()?.();
    await esperar(30);
    expect(motivo).toBe("apos-load");
  });

  it("imagem com erro libera na hora", async () => {
    const img = montar();
    const espera = esperarDestaque({ win: criarWin().win, limite: 5000 });
    img.dispatchEvent(new Event("error"));
    await expect(espera).resolves.toBe("erro");
  });

  it("nunca passa do limite", async () => {
    montar();
    await expect(esperarDestaque({ win: criarWin().win, limite: 10 })).resolves.toBe("limite");
  });
});
