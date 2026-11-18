/* Desempenho no navegador: CLS da página de produto e da vitrine filtrada (#32) e a imagem do destaque só na vitrine (#31) */
import { expect, test, type Page } from "@playwright/test";

const PRODUTO = "/produto/headset-kitty-quartz-rosa-quartzo";
const IMAGEM_DESTAQUE = "/produtos/kitty-quartz.png";

/* Celular, como no Lighthouse móvel; sem animação, para medir só o layout */
test.use({ viewport: { width: 412, height: 823 }, reducedMotion: "reduce" });

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());
});

/* Soma os deslocamentos de layout sem interação, desde o início da página (limite superior do CLS) */
async function medirCls(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) w.__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  return async () => {
    /* Espera as imagens da tela e dois quadros, para os últimos deslocamentos entrarem na conta */
    await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(300);
    return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  };
}

/* A API responde devagar, como no celular: é quando o conteúdo empurra o que já está na tela */
async function apiLenta(page: Page) {
  await page.route(/\/api\/products/, async (rota) => {
    await new Promise((r) => setTimeout(r, 800));
    await rota.continue();
  });
}

test("CLS da página de produto até 0,1 com a API lenta", async ({ page }) => {
  await apiLenta(page);
  const lerCls = await medirCls(page);
  await page.goto(PRODUTO);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const cls = await lerCls();
  console.log(`CLS ${PRODUTO}: ${cls.toFixed(3)}`);
  expect(cls).toBeLessThanOrEqual(0.1);
});

test("CLS da vitrine filtrada até 0,1 com a API lenta", async ({ page }) => {
  await apiLenta(page);
  const lerCls = await medirCls(page);
  await page.goto("/?q=gamer");
  await expect(page.locator(".produto-card").first()).toBeVisible();
  const cls = await lerCls();
  console.log(`CLS /?q=gamer: ${cls.toFixed(3)}`);
  expect(cls).toBeLessThanOrEqual(0.1);
});

/* Registra os pedidos da imagem do destaque feitos na primeira carga */
function contarImagemDestaque(page: Page) {
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === IMAGEM_DESTAQUE) pedidos.push(r.url());
  });
  return pedidos;
}

/* Rotas em que nenhum produto da tela usa a imagem do destaque (o Kitty Quartz é gamer) */
for (const caminho of ["/carrinho", "/produto/vortex-x5-preto-e-vermelho", "/?type=on-ear"]) {
  test(`não baixa a imagem do destaque em ${caminho}`, async ({ page }) => {
    const pedidos = contarImagemDestaque(page);
    await page.goto(caminho);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.waitForLoadState("load");
    expect(pedidos).toEqual([]);
  });
}

test("na vitrine sem filtros, o esqueleto pinta a imagem do destaque antes do React", async ({ page }) => {
  const pedidos = contarImagemDestaque(page);
  /* Segura o JavaScript da loja: o que aparece é só o HTML do esqueleto */
  let liberar: () => void = () => {};
  const espera = new Promise<void>((resolve) => (liberar = resolve));
  await page.route(/\/assets\/index-[^/]+\.js$/, async (rota) => {
    await espera;
    await rota.continue();
  });
  await page.goto("/", { waitUntil: "commit" });
  const img = page.locator("#app-shell img");
  await expect(img).toHaveAttribute("src", IMAGEM_DESTAQUE);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  liberar();
  await expect(page.locator(".produto-card").first()).toBeVisible();
  expect(pedidos.length).toBeGreaterThanOrEqual(1);
});
/* fim de desempenho.spec.ts */
