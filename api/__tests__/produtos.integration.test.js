const request = require("supertest");
const createApp = require("../app");

describe("API /produtos - teste de integração", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /produtos", () => {
    test("retorna 200 e um array com os produtos iniciais", async () => {
      const res = await request(app).get("/produtos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });

  // Criar teste GET /produtos/:id
  describe("GET /produtos/:id", () => {
    test("retorna 200 e o produto correspondente ao id", async () => {
      const id = 1;
      const res = await request(app).get(`/produtos/${id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", id);
      expect(Array.isArray(res.body)).toBe(false);
    });
  });

  describe("POST /produtos", () => {
    test("deve retornar 201 e o produto criado com id gerado", async () => {
      const novoProduto = { nome: "Empada", preco: 6 };
      const res = await request(app).post("/produtos").send(novoProduto);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("nome", novoProduto.nome);
      expect(res.body).toHaveProperty("preco", novoProduto.preco);
    });

    test("deve retornar 400 com { erro: ... } quando o nome estiver faltando", async () => {
      const res = await request(app).post("/produtos").send({ preco: 6 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("deve retornar 400 com { erro: ... } quando o preco estiver faltando", async () => {
      const res = await request(app).post("/produtos").send({ nome: "Empada" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("o produto criado deve aparecer em uma chamada seguinte a GET /produtos", async () => {
      const novoProduto = { nome: "Pastel", preco: 7 };
      const resPost = await request(app).post("/produtos").send(novoProduto);

      const resGet = await request(app).get("/produtos");
      expect(resGet.status).toBe(200);
      expect(resGet.body).toContainEqual(resPost.body);
    });
  });

  describe("DELETE /produtos/:id", () => {
    test("deve retornar 204 quando o produto é removido com sucesso", async () => {
      const id = 1;
      const res = await request(app).delete(`/produtos/${id}`);

      expect(res.status).toBe(204);
    });

    test("o produto removido nao deve mais aparecer em GET /produtos/:id (deve retornar 404)", async () => {
      const id = 1;
      await request(app).delete(`/produtos/${id}`);

      const resGet = await request(app).get(`/produtos/${id}`);
      expect(resGet.status).toBe(404);
    });

    test("deve retornar 404 com { erro: ... } quando o produto nao existir", async () => {
      const idInexistente = 999;
      const res = await request(app).delete(`/produtos/${idInexistente}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});
