import { describe, expect, it } from "vitest";
import { MAX_INTERVALO, validateIntervalo } from "./intervalValidation";

describe("validateIntervalo", () => {
  it("produz a lista inclusiva de concursos do intervalo", () => {
    const result = validateIntervalo("3090", "3094");
    expect(result).toEqual({
      ok: true,
      concursos: [3090, 3091, 3092, 3093, 3094],
    });
  });

  it("de igual a até produz um concurso", () => {
    const result = validateIntervalo("3090", "3090");
    expect(result).toEqual({ ok: true, concursos: [3090] });
  });

  it("exatamente 25 concursos é aceito", () => {
    const result = validateIntervalo("3090", "3114");
    expect(result.ok).toBe(true);
    expect(result.concursos).toHaveLength(25);
    expect(result.concursos[0]).toBe(3090);
    expect(result.concursos[24]).toBe(3114);
  });

  it("26 concursos é recusado citando o limite e o tamanho pedido", () => {
    const result = validateIntervalo("3090", "3115");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("25");
    expect(result.message).toContain("26");
  });

  it("final menor que o inicial é recusado sem inverter os valores", () => {
    const result = validateIntervalo("3095", "3090");
    expect(result.ok).toBe(false);
    expect(result.message).toBeTypeOf("string");
  });

  it.each([
    ["", "3094"],
    ["3090", ""],
    ["abc", "3094"],
    ["3090", "abc"],
    ["0", "3094"],
    ["3090", "-1"],
  ])("entrada inválida de=%s até=%s é recusada", (de, ate) => {
    const result = validateIntervalo(de, ate);
    expect(result.ok).toBe(false);
  });

  it("expõe o teto de 25 como constante", () => {
    expect(MAX_INTERVALO).toBe(25);
  });

  it("ignora espaços em volta dos números", () => {
    const result = validateIntervalo("  3090 ", " 3092  ");
    expect(result).toEqual({ ok: true, concursos: [3090, 3091, 3092] });
  });

  it("aceita zeros à esquerda", () => {
    const result = validateIntervalo("007", "009");
    expect(result).toEqual({ ok: true, concursos: [7, 8, 9] });
  });

  it.each([["3090.5", "3094"], ["3090", "3094.5"]])(
    "recusa número decimal de=%s até=%s",
    (de, ate) => {
      const result = validateIntervalo(de, ate);
      expect(result.ok).toBe(false);
    }
  );
});
