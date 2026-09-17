const {
  soma,
  subtrai,
  multiplica,
  divide,
  ehPar,
  raiz,
  media,
} = require("./calculadora");

describe("soma", () => {
  test("soma dois numeros positivos", () => {
    expect(soma(2, 3)).toBe(5);
  });

  // Criar teste com soma com número negativo
  test("soma um numero negativo com um numero positivo", () => {
    expect(soma(-12, 9)).toBe(-3);
  });
});

describe("raiz", () => {
  test("calcula a raiz de um numero nao exato com precisao", () => {
    expect(raiz(2)).toBeCloseTo(1.414);
  });

  test("lança erro para numero negativo", () => {
    expect(() => raiz(-4)).toThrow(
      // Essa mensagem precisa ser igual ao da calculadora.js
      "Nao e possivel calcular raiz de numero negativo",
    );
  });

  // Criar teste com raiz quadrada de 9
  test("raiz quadrada exata", () => {
    expect(raiz(9)).toBe(3);
  });
});

describe("subtrai", () => {
  test("retorna o resultado correto da subtracao", () => {
    expect(subtrai(10, 4)).toBe(6);
  });

  test("retorna um numero negativo quando o resultado for negativo", () => {
    expect(subtrai(4, 10)).toBe(-6);
  });
});

describe("multiplica", () => {
  test("retorna o produto correto de dois numeros", () => {
    expect(multiplica(5, 7)).toBe(35);
  });

  test("retorna 0 quando um dos fatores for 0", () => {
    expect(multiplica(0, 7)).toBe(0);
  });

  test("resultado maior do que cada um dos fatores individualmente", () => {
    expect(multiplica(7, 3)).toBe(21);
  });
});

describe("divide", () => {
  test("retorna o resultado correto da divisao", () => {
    expect(divide(15, 5)).toBe(3);
  });

  test("lança erro quando b for 0", () => {
    expect(() => divide(3, 0)).toThrow(
      // Essa mensagem precisa ser igual ao da calculadora.js
      "Nao e possivel dividir por zero",
    );
  });
});

describe("ehPar", () => {
  test("retorna um valor verdadeiro para numero par", () => {
    expect(ehPar(26)).toBe(true);
  });

  test("retorna um valor falso para numero impar", () => {
    expect(ehPar(9)).toBe(false);
  });
});

describe("media", () => {
  test("calcula corretamente a media de uma lista de inteiros", () => {
    expect(media([10, 10, 10])).toBe(10);
  });

  test("calcula corretamente a media quando o resultado for decimal", () => {
    expect(media([10, 7])).toBeCloseTo(8.5);
  });

  test("lanca erro quando a lista estiver vazia", () => {
    expect(() => media([])).toThrow(
      // Essa mensagem precisa ser igual ao da calculadora.js
      "A lista de numeros nao pode ser vazia",
    );
  });

  test("lanca erro quando o argumento nao for um array", () => {
    expect(() => media(null)).toThrow(
      // Essa mensagem precisa ser igual ao da calculadora.js
      "A lista de numeros nao pode ser vazia",
    );
  });
});
