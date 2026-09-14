// Busca os resultados dos sorteios.
//
// Fonte: API interna da própria Caixa (servicebus2.caixa.gov.br). A
// alternativa api.guidi.dev.br tem o mesmo formato de resposta, mas não
// envia header Access-Control-Allow-Origin — todo fetch direto do navegador
// era bloqueado por CORS (confirmado em teste, não é suposição). A API da
// Caixa libera CORS (`Access-Control-Allow-Origin: *`) e funciona nas 7
// loterias suportadas.
//
// Se um dia trocar de fonte de novo: BASE_URL, buildUrl() e a lista de
// chaves em normalize()/pick() são os únicos pontos a ajustar.

const BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

function buildUrl(slug, concurso) {
  // Sem sufixo = último concurso. Só aceita concurso como segmento — não
  // existe um "/ultimo" nessa API (dá 400).
  return concurso ? `${BASE_URL}/${slug}/${concurso}` : `${BASE_URL}/${slug}`;
}

// Tenta várias chaves possíveis, na ordem, e devolve a primeira que existir.
function pick(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function normalize(raw) {
  // Dupla-Sena tem 2 sorteios por concurso. "dezenasSorteadasOrdemSorteio"
  // vem com os números dos dois sorteios concatenados (ex: 12 números pra um
  // jogo de 6) — por isso "listaDezenas" (só o 1º sorteio, tamanho certo)
  // tem prioridade aqui.
  const dezenasRaw =
    pick(raw, [
      "dezenas",
      "listaDezenas",
      "dezenasSorteadasOrdemSorteio",
      "dezenasOrdemSorteio",
    ]) || [];
  const dezenasSegundoRaw = pick(raw, ["listaDezenasSegundoSorteio"]);

  const dezenas = dezenasRaw.map((d) => parseInt(d, 10));
  const dezenasSegundo = dezenasSegundoRaw
    ? dezenasSegundoRaw.map((d) => parseInt(d, 10))
    : null;

  return {
    concurso: pick(raw, ["concurso", "numero", "numeroConcurso"]),
    data: pick(raw, ["data", "dataApuracao", "dataSorteio", "dataDoConcurso"]),
    dezenas,
    dezenasSegundo,
    acumulou: Boolean(pick(raw, ["acumulou", "acumulado"])),
    local: pick(raw, ["local", "localDoSorteio", "localSorteio"]) || "",
    valorProximoConcurso: pick(raw, [
      "valorEstimadoProximoConcurso",
      "acumuladaProxConcurso",
      "valorEstimadoPremioProximoConcurso",
    ]),
    dataProximoConcurso: pick(raw, [
      "dataProximoConcurso",
      "dataProxConcurso",
    ]),
    raw,
  };
}

export async function fetchDraw(slug, concurso) {
  const url = buildUrl(slug, concurso);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Não foi possível buscar o resultado (status ${res.status}).`
    );
  }
  const json = await res.json();
  const result = normalize(json);
  if (!result.dezenas.length) {
    throw new Error(
      "A resposta da API veio num formato inesperado. Veja o console para o JSON bruto."
    );
  }
  return result;
}
