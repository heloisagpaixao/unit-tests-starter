import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();
});

// ===================================================================================================== //

test("lista os pedidos iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  const linha = page.getByRole("row").filter({ hasText: "Ana Souza" });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("1");
  await expect(linha).toContainText("2x Coxinha");
  await expect(page.getByRole("cell", { name: "R$ 10,00" })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});

// ===================================================================================================== //

test("monta um pedido com um item", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Bruno Lima");
  await page.getByLabel("Produto").selectOption("Pastel");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByText("1x Pastel")).toBeVisible();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linha).toContainText("1x Pastel");
  await expect(linha).toContainText("R$ 8,00");
  await expect(linha.getByRole("combobox")).toHaveValue("pendente");

  await expect(page.getByLabel("Cliente")).toHaveValue("");
});

// ===================================================================================================== //

test("monta um pedido com vários itens e quantidades", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Ana Souza");

  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByLabel("Quantidade").fill("3");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByLabel("Produto").selectOption("Empada");
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  const linha = page.getByRole("row").filter({ hasText: "3x Coxinha" });
  await expect(linha).toContainText("1x Empada");

  await expect(linha.getByRole("cell", { name: "R$ 21,00" })).toBeVisible();
});

// ===================================================================================================== //

test("quantidade volta a 1 após adicionar item", async ({ page }) => {
  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByLabel("Quantidade").fill("5");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByText("5x Coxinha")).toBeVisible();
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
});

// ===================================================================================================== //

test("não cria pedido sem cliente", async ({ page }) => {
  await page.getByLabel("Produto").selectOption("Coxinha");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();

  await expect(
    page.getByRole("row").filter({ has: page.getByRole("cell") }),
  ).toHaveCount(1);
});

// ===================================================================================================== //

test("não cria pedido sem itens", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption("Ana Souza");
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(
    page.getByText("Pedido deve ter ao menos um item"),
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ has: page.getByRole("cell") }),
  ).toHaveCount(1);
});

// ===================================================================================================== //

test("altera o status de um pedido", async ({ page }) => {
  await page.getByLabel("Status do pedido 1").selectOption("pago");

  await expect(page.getByLabel("Status do pedido 1")).toHaveValue("pago");
});

// ===================================================================================================== //

test("pedido cancelado não pode ser alterado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");

  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pago");

  await expect(
    page.getByText("Pedido cancelado nao pode ser alterado"),
  ).toBeVisible();
  await expect(status).toHaveValue("cancelado");
});

// ===================================================================================================== //

test("remove um pedido", async ({ page }) => {
  await page
    .getByRole("row", { name: /Ana Souza/ })
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByRole("row", { name: /Ana Souza/ })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(1);
});

// ===================================================================================================== //

test('P10: ciclo completo do pedido', async ({ page }) => {
  // 1. Monta e cria o pedido: 2x Empada para Bruno Lima
  await page.getByLabel('Cliente').selectOption('Bruno Lima');
  await page.getByLabel('Produto').selectOption('Empada');
  await page.getByLabel('Quantidade').fill('2');
  await page.getByRole('button', { name: 'Adicionar item' }).click();
  await expect(page.getByText('2x Empada')).toBeVisible();
  await page.getByRole('button', { name: 'Criar pedido' }).click();

  const linha = page.getByRole('row', { name: /Bruno Lima/ });
  const status = linha.getByRole('combobox');

  // Estado: pedido criado, pendente, total 2 x 6 = R$ 12,00
  await expect(linha).toContainText('2x Empada');
  await expect(linha).toContainText('R$ 12,00');
  await expect(status).toHaveValue('pendente');
  await expect(page.getByLabel('Cliente')).toHaveValue('');

  // 2. Marca como pago
  await status.selectOption('pago');
  await expect(status).toHaveValue('pago');

  // 3. Cancela
  await status.selectOption('cancelado');
  await expect(status).toHaveValue('cancelado');

  // 4. Tenta voltar para pendente: deve dar erro e o select volta ao valor do servidor
  await status.selectOption('pendente');
  await expect(page.getByText('Pedido cancelado nao pode ser alterado')).toBeVisible();
  await expect(status).toHaveValue('cancelado');

  // 5. Remove
  await linha.getByRole('button', { name: 'Remover' }).click();
  await expect(linha).toHaveCount(0);

  // Estado final: cabeçalho + pedido da Ana (o #1 do seed)
  await expect(page.getByRole('row')).toHaveCount(2);
  await expect(page.getByRole('row', { name: /Ana Souza/ })).toBeVisible();
});