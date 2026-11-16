/* Acessibilidade: axe (todas as violações) nos temas claro e escuro, com dados do seed, e adição ao carrinho só com o teclado */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PRODUTO = "/produto/headset-kitty-quartz-rosa-quartzo";

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());
});

/* Roda o axe na página inteira e devolve "regra: alvo" de cada violação, de qualquer gravidade */
async function violacoes(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

/* O app tem tema escuro de verdade: o Header lê prefers-color-scheme e grava data-bs-theme no <html> */
for (const tema of ["light", "dark"] as const) {
  test.describe(`tema ${tema === "light" ? "claro" : "escuro"}`, () => {
    test.use({ colorScheme: tema, viewport: { width: 1280, height: 800 } });

    for (const caminho of ["/", "/carrinho", "/entrar", PRODUTO]) {
      test(`axe sem violações em ${caminho}`, async ({ page }) => {
        await page.goto(caminho);
        await expect(page.locator("html")).toHaveAttribute("data-bs-theme", tema);
        await expect(page.getByRole("heading").first()).toBeVisible();
        if (caminho === "/") await expect(page.locator(".produto-card").first()).toBeVisible();
        if (caminho === PRODUTO) await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await violacoes(page)).toEqual([]);
      });
    }

    test("axe sem violações no carrinho com item e no checkout", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-bs-theme", tema);
      await page.locator(".produto-card button.btn-primary:not([disabled])").first().click();
      await expect(page.getByRole("link", { name: "Carrinho com 1 item" })).toBeVisible();

      await page.goto("/carrinho");
      await expect(page.getByRole("button", { name: /Finalizar compra/ })).toBeVisible();
      expect(await violacoes(page)).toEqual([]);

      await page.getByRole("button", { name: /Finalizar compra/ }).click();
      await page.waitForURL(/entrar/);
      await page.getByRole("link", { name: "Criar conta" }).click();
      await page.locator('[name="name"]').fill("Cliente de Teste");
      await page.locator('[name="email"]').fill(`axe.${tema}.${Date.now()}@empresa.test`);
      await page.locator('[name="password"]').fill("senhaDeTeste1");
      await page.getByRole("button", { name: "Criar conta" }).click();
      await page.waitForURL(/checkout/);
      await expect(page.locator('[name="cep"]')).toBeVisible();
      expect(await violacoes(page)).toEqual([]);
    });
  });
}

test("adiciona ao carrinho só com o teclado, com foco visível", async ({ page }) => {
  await page.goto("/");
  const botao = page.locator(".produto-card button.btn-primary:not([disabled])").first();
  await expect(botao).toBeVisible();
  let chegou = false;
  for (let i = 0; i < 80 && !chegou; i += 1) {
    await page.keyboard.press("Tab");
    chegou = await botao.evaluate((b) => b === document.activeElement);
  }
  expect(chegou).toBe(true);
  await page.waitForTimeout(300);
  const foco = await botao.evaluate((b) => {
    const s = getComputedStyle(b);
    return (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
  });
  expect(foco).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Carrinho com 1 item" })).toBeVisible();
});
/* fim de acessibilidade.spec.ts */
