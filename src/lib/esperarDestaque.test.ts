/*
 * esperarDestaque.test.ts · Espera do esqueleto antes de montar o React (#15).
 */
import { afterEach, describe, expect, it } from "vitest";
import { esperarDestaque } from "./esperarDestaque";

function montar(comImagem = true) {
  document.documentElement.className = "";
  document.body.innerHTML = comImagem ? '<div id="app-shell"><img src="/produtos/kitty-quartz.png" alt="" /></div>' : '<div id="app-shell"></div>';
  const img = document.querySelector("img");
  if (img) Object.defineProperty(img, "complete", { value: false, configurable: true });
  return img as HTMLImageElement;
}

const quadros: FrameRequestCallback[] = [];
const win = { setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms), requestAnimationFrame: (fn: FrameRequestCallback) => quadros.push(fn) } as unknown as Window;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.className = "";
  quadros.length = 0;
});

describe("esperarDestaque", () => {
  it("sem esqueleto ou fora da vitrine, não espera", async () => {
    montar(false);
    await expect(esperarDestaque({ win })).resolves.toBe("sem-esqueleto");
    montar();
    document.documentElement.className = "no-shell";
    await expect(esperarDestaque({ win })).resolves.toBe("sem-esqueleto");
  });

  it("só libera depois do load e de dois quadros", async () => {
    const img = montar();
    let motivo: string | null = null;
    esperarDestaque({ win, limite: 5000 }).then((m) => (motivo = m));
    await esperar(20);
    expect(motivo).toBeNull();
    img.dispatchEvent(new Event("load"));
    await esperar(20);
    expect(motivo).toBeNull();
    quadros.shift()?.(0);
    quadros.shift()?.(0);
    await esperar(20);
    expect(motivo).toBe("pintou");
  });

  it("imagem com erro libera na hora", async () => {
    const img = montar();
    const espera = esperarDestaque({ win, limite: 5000 });
    img.dispatchEvent(new Event("error"));
    await expect(espera).resolves.toBe("erro");
  });

  it("nunca passa do limite", async () => {
    montar();
    await expect(esperarDestaque({ win, limite: 10 })).resolves.toBe("limite");
  });
});
