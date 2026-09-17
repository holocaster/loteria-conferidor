import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadSavedDraws,
  removeSavedDraw,
  getDraw,
  getLatestDraw,
  getDrawRange,
} from "./savedDraws";

// Mesmo stub mínimo de storage.test.js — localStorage não existe no ambiente
// node dos testes.
function fakeLocalStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

function drawPayload(concurso, overrides = {}) {
  return {
    concurso,
    dataApuracao: "01/01/2024",
    listaDezenas: ["01", "02", "03", "04", "05", "06"],
    acumulado: false,
    ...overrides,
  };
}

describe("savedDraws", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getDraw salva o resultado de uma busca bem-sucedida", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3090)));

    const { raw: _raw, ...draw } = await getDraw("megasena", 3090);

    expect(draw.concurso).toBe(3090);
    expect(loadSavedDraws("megasena")).toEqual([
      { slug: "megasena", concurso: 3090, draw },
    ]);
  });

  it("getDraw não salva nada quando a busca falha", async () => {
    fetch.mockResolvedValue(jsonResponse(null, false, 500));

    await expect(getDraw("megasena", 9999)).rejects.toThrow();
    expect(loadSavedDraws("megasena")).toEqual([]);
  });

  it("salvar o mesmo concurso duas vezes sobrescreve em vez de duplicar", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);

    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);

    expect(loadSavedDraws("megasena")).toHaveLength(1);
  });

  it("registros são escopados por loteria: mesmo número em duas loterias são dois registros", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(100)));
    await getDraw("megasena", 100);

    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(100)));
    await getDraw("quina", 100);

    expect(loadSavedDraws("megasena")).toHaveLength(1);
    expect(loadSavedDraws("quina")).toHaveLength(1);
  });

  it("loadSavedDraws devolve do maior concurso para o menor", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3092)));
    await getDraw("megasena", 3092);
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3091)));
    await getDraw("megasena", 3091);

    expect(loadSavedDraws("megasena").map((r) => r.concurso)).toEqual([
      3092, 3091, 3090,
    ]);
  });

  it("removeSavedDraw remove só o concurso pedido", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3091)));
    await getDraw("megasena", 3091);

    removeSavedDraw("megasena", 3090);

    expect(loadSavedDraws("megasena").map((r) => r.concurso)).toEqual([3091]);
  });

  it("loadSavedDraws devolve lista vazia quando o JSON salvo está corrompido", () => {
    localStorage.setItem("conferidor:concursos", "{ isso não é json");
    expect(loadSavedDraws("megasena")).toEqual([]);
  });

  it("loadSavedDraws devolve lista vazia quando o JSON salvo não é uma lista", () => {
    localStorage.setItem("conferidor:concursos", "{}");
    expect(loadSavedDraws("megasena")).toEqual([]);
  });

  it("o registro salvo não guarda o campo raw", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3090)));

    await getDraw("megasena", 3090);

    expect(loadSavedDraws("megasena")[0].draw.raw).toBeUndefined();
  });

  it("uma escrita que lança (setItem/cota cheia) não impede a busca de devolver o resultado", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3090)));
    vi.stubGlobal("localStorage", {
      ...fakeLocalStorage(),
      setItem: () => {
        throw new Error("quota exceeded");
      },
    });

    const draw = await getDraw("megasena", 3090);

    expect(draw.concurso).toBe(3090);
  });

  it("getLatestDraw busca sem concurso e salva o resultado que voltou", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3095)));

    const { raw: _raw, ...draw } = await getLatestDraw("megasena");

    expect(fetch).toHaveBeenCalledWith(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena"
    );
    expect(loadSavedDraws("megasena")).toEqual([
      { slug: "megasena", concurso: 3095, draw },
    ]);
  });

  it("getDraw não chama fetch de novo quando o concurso já está salvo", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);

    const draw = await getDraw("megasena", 3090);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(draw.concurso).toBe(3090);
  });

  it("getDraw aceita o concurso pedido como string e acha o registro salvo com número", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);

    const draw = await getDraw("megasena", "3090");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(draw.concurso).toBe(3090);
  });

  it("getDraw não serve o salvo de uma loteria para outra mesmo com o mesmo número de concurso", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(100)));
    await getDraw("megasena", 100);

    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(100)));
    await getDraw("quina", 100);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("getLatestDraw chama fetch mesmo com o concurso já salvo e atualiza o registro salvo", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3095)));
    await getDraw("megasena", 3095);

    fetch.mockResolvedValueOnce(
      jsonResponse(drawPayload(3095, { dataApuracao: "02/02/2024" }))
    );
    const draw = await getLatestDraw("megasena");

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(draw.data).toBe("02/02/2024");
    const saved = loadSavedDraws("megasena");
    expect(saved).toHaveLength(1);
    expect(saved[0].draw.data).toBe("02/02/2024");
  });
});

describe("getDrawRange", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("busca todos os concursos e devolve itens ok na ordem do intervalo", async () => {
    fetch.mockImplementation((url) => {
      const concurso = url.split("/").pop();
      return Promise.resolve(jsonResponse(drawPayload(Number(concurso))));
    });

    const onProgress = vi.fn();
    const results = await getDrawRange(
      "megasena",
      [3090, 3091, 3092],
      onProgress
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results.every((r) => r.status === "ok")).toBe(true);
    expect(onProgress).toHaveBeenCalledTimes(3);
  });

  it("isola a falha de um concurso no meio do intervalo sem derrubar os demais e não salva o que falhou", async () => {
    fetch.mockImplementation((url) => {
      const concurso = Number(url.split("/").pop());
      if (concurso === 3091) {
        return Promise.resolve(jsonResponse(null, false, 500));
      }
      return Promise.resolve(jsonResponse(drawPayload(concurso)));
    });

    const results = await getDrawRange("megasena", [3090, 3091, 3092]);

    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results[0].status).toBe("ok");
    expect(results[1].status).toBe("erro");
    expect(results[1].message).toMatch(/não disponível/);
    expect(results[2].status).toBe("ok");
    expect(
      loadSavedDraws("megasena")
        .map((r) => r.concurso)
        .sort((a, b) => a - b)
    ).toEqual([3090, 3092]);
  });

  it("produz uma lista completa de itens de erro quando todos os concursos falham", async () => {
    fetch.mockImplementation(() =>
      Promise.resolve(jsonResponse(null, false, 500))
    );

    const results = await getDrawRange("megasena", [3090, 3091, 3092]);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.status === "erro")).toBe(true);
  });

  it("lote com parte dos concursos já salvos chama fetch só para os que faltam, na ordem do intervalo", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(drawPayload(3090)));
    await getDraw("megasena", 3090);
    fetch.mockClear();
    fetch.mockImplementation((url) => {
      const concurso = url.split("/").pop();
      return Promise.resolve(jsonResponse(drawPayload(Number(concurso))));
    });

    const onProgress = vi.fn();
    const results = await getDrawRange(
      "megasena",
      [3090, 3091, 3092],
      onProgress
    );

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results.every((r) => r.status === "ok")).toBe(true);
    expect(onProgress).toHaveBeenCalledTimes(3);
  });

  it("um intervalo repetido inteiro não dispara nenhuma requisição", async () => {
    fetch.mockImplementation((url) => {
      const concurso = url.split("/").pop();
      return Promise.resolve(jsonResponse(drawPayload(Number(concurso))));
    });
    await getDrawRange("megasena", [3090, 3091, 3092]);
    fetch.mockClear();

    const results = await getDrawRange("megasena", [3090, 3091, 3092]);

    expect(fetch).not.toHaveBeenCalled();
    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results.every((r) => r.status === "ok")).toBe(true);
  });
});
