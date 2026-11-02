/* Acessibilidade: axe nas telas principais e adição ao carrinho só com o teclado */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());
});

for (const caminho of ["/", "/carrinho", "/entrar"]) {
  test(`axe sem violação séria em ${caminho}`, async ({ page }) => {
    await page.goto(caminho);
    await expect(page.getByRole("heading").first()).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serias = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serias.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
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
