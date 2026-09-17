import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDraw } from "./api";

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

describe("fetchDraw", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("busca o último concurso quando nenhum concurso é passado (sem sufixo na URL)", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3095)));

    await fetchDraw("megasena");

    expect(fetch).toHaveBeenCalledWith(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena"
    );
  });

  it("busca um concurso específico anexando o número como segmento da URL", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3050)));

    await fetchDraw("megasena", 3050);

    expect(fetch).toHaveBeenCalledWith(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3050"
    );
  });

  it("normaliza pelas chaves primárias e converte dezenas pra número", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3090)));

    const result = await fetchDraw("megasena");

    expect(result.concurso).toBe(3090);
    expect(result.data).toBe("01/01/2024");
    expect(result.dezenas).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.acumulou).toBe(false);
    expect(result.dezenasSegundo).toBeNull();
  });

  it("cai pras chaves alternativas quando as primárias não vêm na resposta", async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        numeroConcurso: 3090,
        dataSorteio: "02/02/2024",
        dezenasOrdemSorteio: ["07", "08", "09", "10", "11", "12"],
        acumulado: true,
        localSorteio: "São Paulo, SP",
        acumuladaProxConcurso: 5000000,
        dataProxConcurso: "05/02/2024",
      })
    );

    const result = await fetchDraw("megasena");

    expect(result.concurso).toBe(3090);
    expect(result.data).toBe("02/02/2024");
    expect(result.dezenas).toEqual([7, 8, 9, 10, 11, 12]);
    expect(result.acumulou).toBe(true);
    expect(result.local).toBe("São Paulo, SP");
    expect(result.valorProximoConcurso).toBe(5000000);
    expect(result.dataProximoConcurso).toBe("05/02/2024");
  });

  it("separa o 2º sorteio da Dupla-Sena em dezenasSegundo, convertido pra número", async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        concurso: 2500,
        dataApuracao: "01/01/2024",
        listaDezenas: ["01", "02", "03", "04", "05", "06"],
        listaDezenasSegundoSorteio: ["10", "20", "30", "40", "45", "50"],
        acumulado: false,
      })
    );

    const result = await fetchDraw("duplasena");

    expect(result.dezenas).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.dezenasSegundo).toEqual([10, 20, 30, 40, 45, 50]);
  });

  it("usa listaDezenas (não a lista concatenada) quando ambas estão presentes", async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        concurso: 2500,
        dataApuracao: "01/01/2024",
        listaDezenas: ["01", "02", "03", "04", "05", "06"],
        dezenasSorteadasOrdemSorteio: ["01", "02", "03", "04", "05", "06", "10", "20", "30", "40", "45", "50"],
        acumulado: false,
      })
    );

    const result = await fetchDraw("duplasena");

    expect(result.dezenas).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("rateioPremio vem vazio quando a resposta não traz listaRateioPremio", async () => {
    fetch.mockResolvedValue(jsonResponse(drawPayload(3090)));

    const result = await fetchDraw("megasena");

    expect(result.rateioPremio).toEqual([]);
  });

  it("lança erro com o status HTTP quando a resposta não é ok", async () => {
    fetch.mockResolvedValue(jsonResponse(null, false, 500));

    await expect(fetchDraw("megasena", 9999)).rejects.toThrow(
      "Não foi possível buscar o resultado (status 500)."
    );
  });

  it("lança erro de formato inesperado quando a resposta não tem dezenas em nenhuma chave conhecida", async () => {
    fetch.mockResolvedValue(jsonResponse({ concurso: 3090 }));

    await expect(fetchDraw("megasena")).rejects.toThrow(
      "A resposta da API veio num formato inesperado. Veja o console para o JSON bruto."
    );
  });
});
