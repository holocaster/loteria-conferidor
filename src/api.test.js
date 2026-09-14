import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDrawRange } from "./api";

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

function drawPayload(concurso) {
  return {
    concurso,
    dataApuracao: "01/01/2024",
    listaDezenas: ["01", "02", "03", "04", "05", "06"],
    acumulado: false,
  };
}

describe("fetchDrawRange", () => {
  beforeEach(() => {
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
    const results = await fetchDrawRange(
      "megasena",
      [3090, 3091, 3092],
      onProgress
    );

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results.every((r) => r.status === "ok")).toBe(true);
    expect(onProgress).toHaveBeenCalledTimes(3);
  });

  it("isola a falha de um concurso no meio do intervalo sem derrubar os demais", async () => {
    fetch.mockImplementation((url) => {
      const concurso = Number(url.split("/").pop());
      if (concurso === 3091) {
        return Promise.resolve(jsonResponse(null, false, 500));
      }
      return Promise.resolve(jsonResponse(drawPayload(concurso)));
    });

    const results = await fetchDrawRange("megasena", [3090, 3091, 3092]);

    expect(results.map((r) => r.concurso)).toEqual([3090, 3091, 3092]);
    expect(results[0].status).toBe("ok");
    expect(results[1].status).toBe("erro");
    expect(results[1].message).toMatch(/não disponível/);
    expect(results[2].status).toBe("ok");
  });

  it("produz uma lista completa de itens de erro quando todos os concursos falham", async () => {
    fetch.mockImplementation(() =>
      Promise.resolve(jsonResponse(null, false, 500))
    );

    const results = await fetchDrawRange("megasena", [3090, 3091, 3092]);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.status === "erro")).toBe(true);
  });
});
