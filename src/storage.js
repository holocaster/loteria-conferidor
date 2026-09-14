// Guarda os jogos fixos no navegador (localStorage). Não sai da máquina de
// quem está usando — não tem servidor nem banco de dados nesse projeto.

const KEY = "conferidor:jogos";

export function loadGames() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGames(games) {
  localStorage.setItem(KEY, JSON.stringify(games));
}

export function addGame(game) {
  const games = loadGames();
  const withId = { ...game, id: crypto.randomUUID() };
  saveGames([...games, withId]);
  return withId;
}

export function removeGame(id) {
  saveGames(loadGames().filter((g) => g.id !== id));
}
