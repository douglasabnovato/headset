/* Compra completa: catálogo, carrinho, cadastro e pedido, com o serviço de CEP bloqueado */
import { expect, test } from "@playwright/test";

test("compra de ponta a ponta sem serviço externo", async ({ page, context }) => {
  /* Nada fora do localhost responde: o CEP cai no preenchimento manual */
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());

  await page.goto("/");
  await page.locator(".produto-card button.btn-primary:not([disabled])").first().click();
  await expect(page.getByRole("link", { name: "Carrinho com 1 item" })).toBeVisible();

  await page.goto("/carrinho");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /Finalizar compra/ }).click();

  await page.waitForURL(/entrar/);
  await page.getByRole("link", { name: "Criar conta" }).click();
  await page.locator('[name="name"]').fill("Cliente de Teste");
  await page.locator('[name="email"]').fill(`e2e.${Date.now()}@exemplo.com.br`);
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
  await page.getByRole("link", { name: "Ver detalhes do pedido" }).click();
  await expect(page).toHaveURL(/pedidos\/\d+/);
});
/* fim de compra.spec.ts */
