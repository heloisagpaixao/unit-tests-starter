const request = require("supertest");
const createApp = require("../app");

// Teste de integracao: testa a API de ponta a ponta via HTTP real.
// Cada teste recebe uma app nova (factory), garantindo estado isolado.
//
// Abaixo ha 1 teste pronto (GET /clientes) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-02-CLIENTES.md.

describe("API /clientes (integracao com supertest)", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

// ===================================================================================================== //

  describe("GET /clientes", () => {
    test("retorna 200 e um array com os clientes iniciais", async () => {
      const res = await request(app).get("/clientes");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

// ===================================================================================================== //

  describe("GET /clientes/:id", () => {
    test("retorna 200 e o cliente quando o id existe", async () => {
      const id = 1;
      const res = await request(app).get(`/clientes/${id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", id);
      expect(Array.isArray(res.body)).toBe(false);
    });

    test("retorna 404 com mensagem de erro quando o cliente nao existe", async () => {
      const idInexistente = 999;
      const res = await request(app).get(`/clientes/${idInexistente}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
      expect(res.body.erro).toBe("Cliente nao encontrado");
    });
  });

// ===================================================================================================== //

  describe("POST /clientes", () => {
    test("retorna 201 e o cliente criado com id gerado", async () => {
      const novoCliente = { nome: "Carlos Lima", email: "carlos@email.com" };

      const res = await request(app).post("/clientes").send(novoCliente);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.nome).toBe(novoCliente.nome);
      expect(res.body.email).toBe(novoCliente.email);
    });

    test("retorna 400 quando o nome esta faltando", async () => {
      const clienteSemNome = { email: "semnome@email.com" };

      const res = await request(app).post("/clientes").send(clienteSemNome);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o email esta faltando", async () => {
      const clienteSemEmail = { nome: "Sem Email" };

      const res = await request(app).post("/clientes").send(clienteSemEmail);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando o email ja esta cadastrado", async () => {
      const emailExistente = {
        nome: "Primeiro Cliente",
        email: "duplicado@email.com",
      };
      await request(app).post("/clientes").send(emailExistente);

      const clienteDuplicado = {
        nome: "Segundo Cliente",
        email: "duplicado@email.com",
      };
      const res = await request(app).post("/clientes").send(clienteDuplicado);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("cliente criado aparece em GET /clientes", async () => {
      const novoCliente = {
        nome: "Fernanda Reis",
        email: "fernanda@email.com",
      };
      const resPost = await request(app).post("/clientes").send(novoCliente);
      const idCriado = resPost.body.id;

      const resGet = await request(app).get("/clientes");

      expect(resGet.status).toBe(200);
      expect(resGet.body.length).toBe(3); // 2 iniciais + 1 criado
      expect(resGet.body.some((c) => c.id === idCriado)).toBe(true);
    });
  });

// ===================================================================================================== //

  describe("PUT /clientes/:id", () => {
    test("retorna 200 e o cliente atualizado quando o id existe", async () => {
      const id = 1;
      const dadosAtualizados = {
        nome: "Ana Souza Atualizada",
        email: "ana.nova@email.com",
      };

      const res = await request(app)
        .put(`/clientes/${id}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", id);
      expect(res.body.nome).toBe(dadosAtualizados.nome);
      expect(res.body.email).toBe(dadosAtualizados.email);
    });

    test("retorna 404 quando o cliente nao existe", async () => {
      const idInexistente = 999;
      const dadosAtualizados = {
        nome: "Nao Importa",
        email: "naoimporta@email.com",
      };

      const res = await request(app)
        .put(`/clientes/${idInexistente}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
      expect(res.body.erro).toBe("Cliente nao encontrado");
    });

    test("retorna 400 quando o novo email ja pertence a outro cliente", async () => {
      const outroCliente = {
        nome: "Cliente Dois",
        email: "clientedois@email.com",
      };
      const resPost = await request(app).post("/clientes").send(outroCliente);
      const idOutroCliente = resPost.body.id;

      const idAlvo = 1;
      const dadosComEmailDuplicado = {
        nome: "Ana Souza",
        email: outroCliente.email,
      };

      const res = await request(app)
        .put(`/clientes/${idAlvo}`)
        .send(dadosComEmailDuplicado);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

// ===================================================================================================== //

  describe("DELETE /clientes/:id", () => {
    test("retorna 204 quando o cliente e removido com sucesso", async () => {
      const id = 1;

      const res = await request(app).delete(`/clientes/${id}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    test("cliente removido nao aparece mais na listagem", async () => {
      const id = 1;

      await request(app).delete(`/clientes/${id}`);

      const resGet = await request(app).get("/clientes");

      expect(resGet.status).toBe(200);
      expect(resGet.body.length).toBe(1); // 2 iniciais - 1 removido
      expect(resGet.body.some((c) => c.id === id)).toBe(false);
    });

    test("retorna 404 quando o cliente nao existe", async () => {
      const idInexistente = 999;

      const res = await request(app).delete(`/clientes/${idInexistente}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
      expect(res.body.erro).toBe("Cliente nao encontrado");
    });
  });
});
