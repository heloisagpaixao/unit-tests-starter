import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status().toBe(204));
  await page.goto("/");
});

test("lista os produtos iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Produto" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(4);
  await expect(page.getByRole("cell", { name: "Coxinha" })).toBeVisible();
});

test("cadastra um produto novo", async ({ page }) => {
  await page.getByLabel("Nome").fill("Kibe");
  await page.getByLabel("Preco").fill("7");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const linha = page.getByRole("row", { name: /Kibe/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("R$ 7,00");
});

test("mostra erro ao cadastrar sem preenchimento", async ({ page }) => {
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Nome e preco sao orbigatorios")).toBeVisible();
});

test("remove um produto", async ({ page }) => {
  const linha = page.getByRole("row", { name: /pastel/ });
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(linha).toHaveCount(0);
});
