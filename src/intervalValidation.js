// Valida os campos "de"/"até" do modo de intervalo e devolve a lista de
// concursos a buscar, ou uma recusa com mensagem em pt-BR. Puro: sem fetch,
// sem React. Nunca inverte nem corta os valores digitados.

export const MAX_INTERVALO = 25;

function parseConcurso(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  return n >= 1 ? n : null;
}

export function validateIntervalo(deRaw, ateRaw) {
  const de = parseConcurso(deRaw);
  const ate = parseConcurso(ateRaw);
  if (de === null || ate === null) {
    return {
      ok: false,
      message:
        "Informe os dois concursos do intervalo, com números inteiros a partir de 1.",
    };
  }
  if (ate < de) {
    return {
      ok: false,
      message: "O concurso final não pode ser menor que o inicial.",
    };
  }
  const tamanho = ate - de + 1;
  if (tamanho > MAX_INTERVALO) {
    return {
      ok: false,
      message: `O intervalo pode ter no máximo ${MAX_INTERVALO} concursos (você pediu ${tamanho}).`,
    };
  }
  const concursos = [];
  for (let n = de; n <= ate; n++) concursos.push(n);
  return { ok: true, concursos };
}
