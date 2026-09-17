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
