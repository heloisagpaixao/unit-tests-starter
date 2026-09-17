const ProdutoService = require("../services/ProdutoService");

describe("ProdutoService - testes unitários", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    service = new ProdutoService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna resultado", () => {
      const produtos = [{ id: 1, nome: "Coxinha", preco: 5 }];
      mockRepository.findAll.mockReturnValue(produtos);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produtos);
    });
  });
  // Criar teste repository.findById
  describe("buscarPorId", () => {
    test("chama repository.findById com o id e retorna o produto", () => {
      const id = 1;
      const produto = { id: 1, nome: "Coxinha", preco: 5 };
      mockRepository.findById.mockReturnValue(produto);

      const resultado = service.buscarPorId(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(resultado).toEqual(produto);
    });
  });

  describe("criar", () => {
    test("deve repassar dados para mockRepository.create e retornar o produto criado", () => {
      const novosDados = { nome: "Brigadeiro", preco: 3 };
      const produtoCriado = { id: 4, ...novosDados };
      mockRepository.create.mockReturnValue(produtoCriado);

      const resultado = service.criar(novosDados);

      expect(mockRepository.create).toHaveBeenCalledWith(novosDados);
      expect(resultado).toEqual(produtoCriado);
    });

    test("deve propagar o erro lançado pelo repository quando os dados forem inválidos", () => {
      const dadosInvalidos = { nome: "" };
      mockRepository.create.mockImplementation(() => {
        throw new Error("Dados inválidos");
      });

      expect(() => service.criar(dadosInvalidos)).toThrow();
    });
  });

  describe("remover", () => {
    test("deve chamar mockRepository.delete com o id correto quando o produto existe", () => {
      const id = 1;
      mockRepository.delete.mockReturnValue(true);

      expect(() => service.remover(id)).not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    test("deve lançar erro 'Produto nao encontrado' quando o repository retornar false", () => {
      const id = 999;
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(id)).toThrow("Produto nao encontrado");
    });
  });
});
