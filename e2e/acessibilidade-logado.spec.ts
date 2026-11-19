/* Acessibilidade das telas logadas (#36): axe em pedidos (cliente) e no admin, nos temas claro e escuro, e Esc no modal do admin */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/* Conta de administração do seed (server/src/db/seed.ts); o e2e usa o banco em memória */
const ADMIN = { email: "admin@headset.dev", senha: "Admin@123" };

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());
});

/* Roda o axe na página inteira e devolve "regra: alvo" de cada violação, de qualquer gravidade */
async function violacoes(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

/* Espera sumir todo "Carregando…" da página */
async function semCarregando(page: Page) {
  await expect(page.locator(".carregando")).toHaveCount(0);
}

/* Cria uma conta de cliente e conclui uma compra; devolve na página de confirmação */
async function comprar(page: Page, rotulo: string) {
  await page.goto("/");
  await page.locator(".produto-card button.btn-primary:not([disabled])").first().click();
  await expect(page.getByRole("link", { name: "Carrinho com 1 item" })).toBeVisible();
  await page.goto("/carrinho");
  await page.getByRole("button", { name: /Finalizar compra/ }).click();
  await page.waitForURL(/entrar/);
  await page.getByRole("link", { name: "Criar conta" }).click();
  await page.locator('[name="name"]').fill("Cliente de Teste");
  await page.locator('[name="email"]').fill(`logado.${rotulo}.${Date.now()}@empresa.test`);
  await page.locator('[name="password"]').fill("senhaDeTeste1");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await page.waitForURL(/checkout/);
  await page.locator('[name="telefone"]').fill("11912345678");
  await page.locator('[name="cep"]').fill("01311000");
  await expect(page.getByText(/Preencha o endereço/)).toBeVisible();
  await page.locator('[name="rua"]').fill("Avenida Paulista");
  await page.locator('[name="numero"]').fill("1000");
  await page.locator('[name="bairro"]').fill("Bela Vista");
  await page.locator('[name="cidade"]').fill("São Paulo");
  await page.locator('[name="uf"]').fill("SP");
  await page.locator('[name="cartao"]').fill("4111111111111111");
  await page.locator('[name="titular"]').fill("CLIENTE DE TESTE");
  await page.locator('[name="validade"]').fill("12/35");
  await page.locator('[name="cvv"]').fill("123");
  await page.getByRole("button", { name: /Fechar pedido/ }).click();
  await expect(page.getByRole("heading", { name: /Pedido #\d+ confirmado/ })).toBeVisible();
}

/* Entra com a conta de administração do seed e cai no painel de produtos */
async function entrarComoAdmin(page: Page) {
  await page.goto("/entrar?voltar=%2Fadmin%2Fprodutos");
  await page.locator('[name="email"]').fill(ADMIN.email);
  await page.locator('[name="password"]').fill(ADMIN.senha);
  await page.locator("#conteudo").getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(/admin\/produtos/);
  await expect(page.getByRole("table")).toBeVisible();
}

for (const tema of ["light", "dark"] as const) {
  test.describe(`tema ${tema === "light" ? "claro" : "escuro"}`, () => {
    test.use({ colorScheme: tema, viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

    test("axe sem violações em /pedidos e /pedidos/<id>, depois de uma compra", async ({ page }) => {
      await comprar(page, tema);
      await expect(page.locator("html")).toHaveAttribute("data-bs-theme", tema);

      await page.goto("/pedidos");
      await expect(page.getByRole("heading", { name: "Meus pedidos" })).toBeVisible();
      await semCarregando(page);
      expect(await violacoes(page)).toEqual([]);

      await page.getByRole("link", { name: /Pedido #\d+/ }).first().click();
      await expect(page.getByRole("heading", { level: 1, name: /Pedido #\d+/ })).toBeVisible();
      await semCarregando(page);
      expect(await violacoes(page)).toEqual([]);
    });

    test("axe sem violações em /admin/produtos e /admin/relatorios", async ({ page }) => {
      await entrarComoAdmin(page);
      await expect(page.locator("html")).toHaveAttribute("data-bs-theme", tema);
      await semCarregando(page);
      expect(await violacoes(page)).toEqual([]);

      await page.goto("/admin/relatorios");
      await expect(page.getByRole("heading", { name: "Relatórios de vendas" })).toBeVisible();
      await semCarregando(page);
      expect(await violacoes(page)).toEqual([]);
    });
  });
}

test("no modal do admin, Esc fecha e o foco volta ao botão que o abriu", async ({ page }) => {
  await entrarComoAdmin(page);
  const botao = page.getByRole("button", { name: /^Excluir / }).first();
  await expect(botao).toBeVisible();
  /* Só teclado: Tab até o primeiro "Excluir", sem .focus() */
  let chegou = false;
  for (let i = 0; i < 80 && !chegou; i += 1) {
    await page.keyboard.press("Tab");
    chegou = await botao.evaluate((b) => b === document.activeElement);
  }
  expect(chegou).toBe(true);
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: "Excluir produto?" });
  await expect(dialogo).toBeVisible();
  await expect.poll(() => dialogo.evaluate((d) => d.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect.poll(() => botao.evaluate((b) => b === document.activeElement)).toBe(true);
  /* Foco visível no botão de volta */
  expect(await botao.evaluate((b) => b.matches(":focus-visible"))).toBe(true);
});
/* fim de acessibilidade-logado.spec.ts */
