/* Falhas tratadas na vitrine: carregamento, erro de rede com nova tentativa e lista vazia */
import { expect, test } from "@playwright/test";

/* Só a listagem do catálogo (/api/products e /api/products?...), não o produto do destaque (/api/products/<slug>) */
const LISTAGEM = /\/api\/products(\?.*)?$/;

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost)/, (rota) => rota.abort());
});

test("mostra o carregamento enquanto a API demora", async ({ page }) => {
  let liberar: () => void = () => {};
  const espera = new Promise<void>((resolve) => (liberar = resolve));
  await page.route(LISTAGEM, async (rota) => {
    await espera;
    await rota.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: "Carregando headphones" })).toBeVisible();
  liberar();
  await expect(page.locator(".produto-card").first()).toBeVisible();
  await expect(page.getByText("Carregando headphones")).toHaveCount(0);
});

test("avisa a falha de rede e recupera com Tentar de novo", async ({ page }) => {
  let falhar = true;
  await page.route(LISTAGEM, (rota) => (falhar ? rota.abort("connectionrefused") : rota.continue()));
  await page.goto("/");
  await expect(page.getByText("Não foi possível carregar o catálogo")).toBeVisible();
  await expect(page.getByText(/Sem conexão com o servidor/)).toBeVisible();
  await expect(page.locator(".produto-card")).toHaveCount(0);

  falhar = false;
  await page.getByRole("button", { name: "Tentar de novo" }).click();
  await expect(page.locator(".produto-card").first()).toBeVisible();
  await expect(page.getByText("Não foi possível carregar o catálogo")).toHaveCount(0);
});

test("mostra a mensagem de vazio quando o catálogo não tem produtos", async ({ page }) => {
  /* Vitrine sem filtro: sem o mock, a API do seed devolveria produtos */
  await page.route(LISTAGEM, (rota) =>
    rota.fulfill({ json: { items: [], total: 0, page: 1, perPage: 12, pages: 0 } })
  );
  await page.goto("/");
  await expect(page.getByText("Nenhum headphone encontrado")).toBeVisible();
  await expect(page.locator(".produto-card")).toHaveCount(0);
  await expect(page.getByText("0 produtos encontrados")).toBeAttached();
});
/* fim de falhas.spec.ts */
