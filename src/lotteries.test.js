import { describe, expect, it } from "vitest";
import { countHits, findPrizeValue } from "./lotteries";

describe("countHits", () => {
  it("conta os números do jogo que batem com o sorteio", () => {
    expect(countHits([1, 2, 3, 4], [4, 3, 9, 10])).toBe(2);
  });

  it("devolve zero quando nenhum número bate", () => {
    expect(countHits([1, 2, 3], [4, 5, 6])).toBe(0);
  });
});

describe("findPrizeValue", () => {
  const rateio = [
    { descricaoFaixa: "6 acertos", faixa: 1, numeroDeGanhadores: 0, valorPremio: 0 },
    { descricaoFaixa: "5 acertos", faixa: 2, numeroDeGanhadores: 86, valorPremio: 31872.72 },
    { descricaoFaixa: "4 acertos", faixa: 3, numeroDeGanhadores: 5234, valorPremio: 863.24 },
  ];

  it("acha o valor do prêmio pela faixa de acertos", () => {
    expect(findPrizeValue(rateio, 5)).toBe(31872.72);
    expect(findPrizeValue(rateio, 4)).toBe(863.24);
  });

  it("devolve null quando a faixa de acertos não existe na lista", () => {
    expect(findPrizeValue(rateio, 2)).toBeNull();
  });

  it("devolve null quando não há lista de rateio", () => {
    expect(findPrizeValue([], 5)).toBeNull();
    expect(findPrizeValue(null, 5)).toBeNull();
  });

  // Dupla-Sena: a lista vem com as faixas do 1º sorteio seguidas das do 2º,
  // na mesma ordem — segment/segments seleciona a metade certa.
  it("separa 1º e 2º sorteio da Dupla-Sena pelo segmento", () => {
    const duplaSena = [
      { descricaoFaixa: "6 acertos", faixa: 1, numeroDeGanhadores: 0, valorPremio: 0 },
      { descricaoFaixa: "5 acertos", faixa: 2, numeroDeGanhadores: 9, valorPremio: 7366.49 },
      { descricaoFaixa: "6 acertos", faixa: 3, numeroDeGanhadores: 0, valorPremio: 0 },
      { descricaoFaixa: "5 acertos", faixa: 4, numeroDeGanhadores: 14, valorPremio: 4262.04 },
    ];

    expect(findPrizeValue(duplaSena, 5, 0, 2)).toBe(7366.49);
    expect(findPrizeValue(duplaSena, 5, 1, 2)).toBe(4262.04);
  });
});
