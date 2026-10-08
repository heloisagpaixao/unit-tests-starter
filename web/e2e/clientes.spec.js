import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Clientes" }).click();
});

// ===================================================================================================== //

test("lista os clientes iniciais", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bruno Lima" })).toBeVisible();
});

// ===================================================================================================== //

test("cadastra um cliente novo", async ({ page }) => {
  await page.getByLabel("Nome").fill("Carla Dias");
  await page.getByLabel("Email").fill("carla@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const linha = page.getByRole("row", { name: /Carla Dias/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("carla@email.com");

  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

// ===================================================================================================== //

test("mostra erro ao cadastrar sem preenchimento", async ({ page }) => {
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Nome e email sao obrigatorios")).toBeVisible();
});

// ===================================================================================================== //

test("Não cadastra cliente com email duplicado", async ({ page }) => {
  const linhas = page.getByRole("row");

  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();

  const totalAntes = await linhas.count();

  await page.getByLabel("Nome").fill("Ana Souza");
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText("Email ja cadastrado")).toBeVisible();
  await expect(linhas).toHaveCount(totalAntes);
});

// ===================================================================================================== //

test("Edita um cliente existente", async ({ page }) => {
  const linhaBruno = page.getByRole("row").filter({ hasText: "Bruno Lima" });
  await linhaBruno.getByRole("button", { name: "Editar" }).click();

  await expect(page.getByLabel("Nome")).toHaveValue("Bruno Lima");
  await expect(page.getByLabel("Email")).not.toHaveValue("");

  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cadastrar" }),
  ).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();

  await page.getByLabel("Nome").fill("Bruno Lima Silva");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByRole("row").filter({ hasText: "Bruno Lima Silva" }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Cancelar" }),
  ).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

// ===================================================================================================== //

test("cancela edição e não salva alterações", async ({ page }) => {
  const linhaAna = page.getByRole("row", { name: /Ana Souza/ });
  const campoNome = page.getByLabel("Nome");
  const campoEmail = page.getByLabel("E-mail");

  await linhaAna.getByRole("button", { name: "Editar" }).click();
  await expect(campoNome).toHaveValue("Ana Souza");
  await campoNome.fill("Ana Alterada");

  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(page.getByRole("row", { name: /Ana Souza/ })).toBeVisible();
  await expect(page.getByText("Ana Alterada")).toHaveCount(0);
});

// ===================================================================================================== //

test("edita para um e-mail já usado e é rejeitado", async ({ page }) => {
  const linhaBruno = page.getByRole("row", { name: /Bruno Lima/ });
  const campoEmail = page.getByLabel("Email");

  await linhaBruno.getByRole("button", { name: "Editar" }).click();
  await expect(campoEmail).toHaveValue("bruno@email.com");
  await campoEmail.fill("ana@email.com");

  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Email ja cadastrado")).toBeVisible();

  const linhaBrunoApos = page.getByRole("row", { name: /Bruno Lima/ });
  await expect(linhaBrunoApos).toContainText("bruno@email.com");
});

// ===================================================================================================== //

test("remove um cliente", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(linha).toHaveCount(0);
});

// ===================================================================================================== //

test("fluxo completo de cadastro, edição, duplicidade e remoção", async ({
  page,
}) => {
  const campoNome = page.getByLabel("Nome");
  const campoEmail = page.getByLabel("Email");
  const linhas = page.getByRole("row").filter({ has: page.getByRole("cell") });

  await expect(linhas).toHaveCount(2);

  // 1. Cadastra "Diego"
  await campoNome.fill("Diego");
  await campoEmail.fill("diego@email.com");
  await page
    .getByRole("button", { name: /Salvar|Adicionar|Cadastrar/ })
    .click();

  await expect(page.getByRole("row", { name: /Diego/ })).toBeVisible();
  await expect(linhas).toHaveCount(3);

  // 2. Edita o nome para "Diego Matos"
  await page
    .getByRole("row", { name: /Diego/ })
    .getByRole("button", { name: "Editar" })
    .click();
  await expect(campoNome).toHaveValue("Diego");
  await campoNome.fill("Diego Matos");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("row", { name: /Diego Matos/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Diego Matos/ })).toContainText(
    "diego@email.com",
  );
  await expect(linhas).toHaveCount(3);

  // 3. Tenta cadastrar um segundo cliente com o mesmo e-mail
  await campoNome.fill("Outro Diego");
  await campoEmail.fill("diego@email.com");
  await page
    .getByRole("button", { name: /Salvar|Adicionar|Cadastrar/ })
    .click();

  await expect(page.getByText("Email ja cadastrado")).toBeVisible();
  await expect(page.getByRole("row", { name: /Outro Diego/ })).toHaveCount(0);
  await expect(linhas).toHaveCount(3);

  // 4. Remove "Diego Matos"
  await page
    .getByRole("row", { name: /Diego Matos/ })
    .getByRole("button", { name: /Excluir|Remover/ })
    .click();

  await expect(page.getByRole("row", { name: /Diego Matos/ })).toHaveCount(0);

  // 5. Contagem final: volta a 2 linhas (Ana e Bruno)
  await expect(linhas).toHaveCount(2);
  await expect(page.getByRole("row", { name: /Ana Souza/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Bruno Lima/ })).toBeVisible();
});
