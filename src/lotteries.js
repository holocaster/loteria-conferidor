// Config de cada loteria: quantos números o jogo tem, faixa de valores,
// e a partir de quantos acertos já vale prêmio (usado só pra destacar na tela).
export const LOTTERIES = {
  megasena: {
    slug: "megasena",
    label: "Mega-Sena",
    pick: 6,
    range: [1, 60],
    prizeFrom: 4,
    color: "#1B7A3D",
  },
  lotofacil: {
    slug: "lotofacil",
    label: "Lotofácil",
    pick: 15,
    range: [1, 25],
    prizeFrom: 11,
    color: "#9C1E8C",
  },
  quina: {
    slug: "quina",
    label: "Quina",
    pick: 5,
    range: [1, 80],
    prizeFrom: 2,
    color: "#2B0B65",
  },
  lotomania: {
    slug: "lotomania",
    label: "Lotomania",
    pick: 50,
    range: [0, 99],
    prizeFrom: 15,
    color: "#F58220",
  },
  duplasena: {
    slug: "duplasena",
    label: "Dupla-Sena",
    pick: 6,
    range: [1, 50],
    prizeFrom: 3,
    color: "#A6003D",
  },
  timemania: {
    slug: "timemania",
    label: "Timemania",
    pick: 10,
    range: [1, 80],
    prizeFrom: 3,
    color: "#1AA5A0",
  },
  diadesorte: {
    slug: "diadesorte",
    label: "Dia de Sorte",
    pick: 7,
    range: [1, 31],
    prizeFrom: 4,
    color: "#CBA135",
  },
};

export const LOTTERY_LIST = Object.values(LOTTERIES);

// Conta quantos números do jogo salvo batem com os números sorteados.
export function countHits(savedNumbers, drawnNumbers) {
  const drawnSet = new Set(drawnNumbers.map(Number));
  return savedNumbers.filter((n) => drawnSet.has(Number(n))).length;
}
