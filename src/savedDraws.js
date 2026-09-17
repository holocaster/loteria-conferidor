// Guarda os concursos já buscados no navegador (localStorage), numa chave
// própria — irmã da de storage.js (jogos fixos), nunca a mesma: apagar um
// concurso salvo não pode arriscar um jogo fixo. Dono também da política de
// quando usar o salvo em vez de ir à API: getDraw usa o salvo sem requisição
// quando existe; getLatestDraw sempre busca, pois pode ter saído um sorteio
// novo desde a última vez.

import { fetchDraw } from "./api";

const KEY = "conferidor:concursos";

function loadAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // Gravação é best-effort: cota cheia não pode impedir a busca de devolver
    // o resultado.
  }
}

function record(slug, draw) {
  const { raw: _raw, ...drawWithoutRaw } = draw;
  const concurso = Number(draw.concurso);
  const others = loadAll().filter(
    (r) => !(r.slug === slug && Number(r.concurso) === concurso)
  );
  saveAll([...others, { slug, concurso, draw: drawWithoutRaw }]);
}

export function loadSavedDraws(slug) {
  return loadAll()
    .filter((r) => r.slug === slug)
    .sort((a, b) => b.concurso - a.concurso);
}

export function removeSavedDraw(slug, concurso) {
  const target = Number(concurso);
  saveAll(
    loadAll().filter((r) => !(r.slug === slug && Number(r.concurso) === target))
  );
}

function findSaved(slug, concurso) {
  const target = Number(concurso);
  return loadAll().find((r) => r.slug === slug && Number(r.concurso) === target);
}

export async function getDraw(slug, concurso) {
  const existing = findSaved(slug, concurso);
  if (existing) return existing.draw;
  const draw = await fetchDraw(slug, concurso);
  record(slug, draw);
  return draw;
}

export async function getLatestDraw(slug) {
  const draw = await fetchDraw(slug);
  record(slug, draw);
  return draw;
}

// Mensagem de erro por item do modo de intervalo. HTTP 500 na API da Caixa
// cobre tanto "concurso ainda não sorteado" quanto erro real do servidor —
// a API não distingue os dois — por isso fala em "não disponível" e nunca
// afirma que o concurso não existe. Não reaproveita a mensagem de fetchDraw,
// que continua igual e é usada pelo modo de um concurso só.
function rangeItemErrorMessage(concurso) {
  return `Concurso ${concurso} não disponível (ainda não sorteado ou indisponível no momento).`;
}

// Busca vários concursos de uma loteria, sequencialmente, reutilizando
// getDraw — cada um usa o salvo se existir ou busca e salva. A falha de um
// concurso não propaga: vira um item de erro na posição dele (e não é
// salvo) e a busca segue para os seguintes.
export async function getDrawRange(slug, concursos, onProgress) {
  const results = [];
  for (let i = 0; i < concursos.length; i++) {
    const concurso = concursos[i];
    let item;
    try {
      const draw = await getDraw(slug, concurso);
      item = { concurso, status: "ok", draw };
    } catch {
      item = { concurso, status: "erro", message: rangeItemErrorMessage(concurso) };
    }
    results.push(item);
    if (onProgress) onProgress(item, i + 1, concursos.length);
  }
  return results;
}
