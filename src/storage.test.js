import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadGames, saveGames, addGame, removeGame } from "./storage";

// Node não tem localStorage global (nem em test env) — stub mínimo em
// memória, só com o que storage.js usa (getItem/setItem).
function fakeLocalStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loadGames devolve lista vazia quando nada foi salvo ainda", () => {
    expect(loadGames()).toEqual([]);
  });

  it("loadGames devolve lista vazia quando o valor salvo é JSON inválido", () => {
    localStorage.setItem("conferidor:jogos", "{ isso não é json");
    expect(loadGames()).toEqual([]);
  });

  it("addGame atribui um id e persiste o jogo", () => {
    const saved = addGame({ slug: "megasena", numbers: [1, 2, 3, 4, 5, 6], label: "" });
    expect(saved.id).toBeTypeOf("string");
    expect(saved.id).not.toBe("");
    expect(loadGames()).toEqual([saved]);
  });

  it("addGame acrescenta sem sobrescrever jogos já salvos", () => {
    const first = addGame({ slug: "megasena", numbers: [1, 2, 3, 4, 5, 6], label: "" });
    const second = addGame({ slug: "quina", numbers: [1, 2, 3, 4, 5], label: "" });
    expect(loadGames()).toEqual([first, second]);
  });

  it("removeGame remove só o jogo com o id indicado", () => {
    const first = addGame({ slug: "megasena", numbers: [1, 2, 3, 4, 5, 6], label: "" });
    const second = addGame({ slug: "quina", numbers: [1, 2, 3, 4, 5], label: "" });

    removeGame(first.id);

    expect(loadGames()).toEqual([second]);
  });

  it("saveGames/loadGames fazem round-trip preservando o formato do jogo", () => {
    const games = [{ id: "abc", slug: "lotofacil", numbers: [1, 2, 3], label: "pai" }];
    saveGames(games);
    expect(loadGames()).toEqual(games);
  });
});
