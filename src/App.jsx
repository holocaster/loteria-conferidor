import { useEffect, useMemo, useState } from "react";
import { LOTTERY_LIST, LOTTERIES, countHits } from "./lotteries";
import { fetchDraw } from "./api";
import { loadGames, addGame, removeGame } from "./storage";
import NumberPicker from "./NumberPicker";
import "./App.css";

function formatMoney(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.startsWith("R$") ? value : `R$ ${value}`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function App() {
  const [activeSlug, setActiveSlug] = useState("megasena");
  const [games, setGames] = useState(loadGames);
  const [concursoInput, setConcursoInput] = useState("");
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNumbers, setNewNumbers] = useState([]);
  const [ownerLabel, setOwnerLabel] = useState("");

  const active = LOTTERIES[activeSlug];

  useEffect(() => {
    setDraw(null);
    setError(null);
    setConcursoInput("");
    setNewNumbers([]);
  }, [activeSlug]);

  const gamesForActive = useMemo(
    () => games.filter((g) => g.slug === activeSlug),
    [games, activeSlug]
  );

  async function handleFetch(useLatest) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDraw(
        active.slug,
        useLatest ? undefined : concursoInput
      );
      setDraw(result);
    } catch (err) {
      setError(err.message);
      setDraw(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAddGame() {
    if (newNumbers.length !== active.pick) return;
    const saved = addGame({
      slug: active.slug,
      numbers: [...newNumbers].sort((a, b) => a - b),
      label: ownerLabel.trim(),
    });
    setGames((prev) => [...prev, saved]);
    setNewNumbers([]);
    setOwnerLabel("");
  }

  function handleRemoveGame(id) {
    removeGame(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow-free">conferidor de loteria</p>
        <h1>Seus jogos fixos, conferidos sozinhos.</h1>
        <p className="hero-sub">
          Cadastre os números que vocês sempre jogam e veja na hora se bateu
          com o sorteio — Mega-Sena, Lotofácil, Quina e as outras loterias da
          Caixa, tudo num lugar só.
        </p>
      </header>

      <nav className="tabs" aria-label="Escolher loteria">
        {LOTTERY_LIST.map((l) => (
          <button
            key={l.slug}
            className={l.slug === activeSlug ? "tab tab-active" : "tab"}
            style={l.slug === activeSlug ? { "--tab-color": l.color } : undefined}
            onClick={() => setActiveSlug(l.slug)}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <main className="panel">
        <section className="check-section">
          <h2>Conferir sorteio</h2>
          <div className="fetch-row">
            <input
              type="number"
              inputMode="numeric"
              placeholder="nº do concurso"
              value={concursoInput}
              onChange={(e) => setConcursoInput(e.target.value)}
              aria-label="Número do concurso"
            />
            <button onClick={() => handleFetch(false)} disabled={loading || !concursoInput}>
              Buscar concurso
            </button>
            <button className="secondary" onClick={() => handleFetch(true)} disabled={loading}>
              Usar o último sorteio
            </button>
          </div>

          {loading && <p className="status">Buscando resultado…</p>}
          {error && <p className="status status-error">{error}</p>}

          {draw && (
            <div className="ticket" style={{ "--accent": active.color }}>
              <div className="ticket-head">
                <span>{active.label}</span>
                <span>Concurso {draw.concurso}</span>
                {draw.data && <span>{draw.data}</span>}
              </div>
              {draw.dezenasSegundo && <p className="status">1º sorteio</p>}
              <div className="balls">
                {draw.dezenas.map((n) => (
                  <span className="ball" key={n}>
                    {String(n).padStart(2, "0")}
                  </span>
                ))}
              </div>
              {draw.dezenasSegundo && (
                <>
                  <p className="status">2º sorteio</p>
                  <div className="balls">
                    {draw.dezenasSegundo.map((n) => (
                      <span className="ball" key={n}>
                        {String(n).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {draw.acumulou && draw.valorProximoConcurso && (
                <p className="ticket-note">
                  Acumulou! Próximo prêmio estimado: {formatMoney(draw.valorProximoConcurso)}
                  {draw.dataProximoConcurso ? ` (sorteio em ${draw.dataProximoConcurso})` : ""}
                </p>
              )}

              {gamesForActive.length > 0 && (
                <div className="results">
                  <h3>Seus jogos nesse concurso</h3>
                  {gamesForActive.map((g) => {
                    const hits = countHits(g.numbers, draw.dezenas);
                    const hits2 = draw.dezenasSegundo
                      ? countHits(g.numbers, draw.dezenasSegundo)
                      : null;
                    const won =
                      hits >= active.prizeFrom ||
                      (hits2 !== null && hits2 >= active.prizeFrom);
                    const isHit = (n) =>
                      draw.dezenas.includes(n) ||
                      (draw.dezenasSegundo && draw.dezenasSegundo.includes(n));
                    return (
                      <div className={won ? "result-row result-won" : "result-row"} key={g.id}>
                        <div className="result-numbers">
                          {g.numbers.map((n) => (
                            <span
                              key={n}
                              className={isHit(n) ? "chip chip-hit" : "chip"}
                            >
                              {String(n).padStart(2, "0")}
                            </span>
                          ))}
                        </div>
                        <div className="result-meta">
                          {g.label && <span className="result-label">{g.label}</span>}
                          <span className={won ? "hit-count hit-count-won" : "hit-count"}>
                            {hits2 !== null
                              ? `1º sorteio: ${hits} acerto${hits === 1 ? "" : "s"} · 2º sorteio: ${hits2} acerto${hits2 === 1 ? "" : "s"}`
                              : `${hits} acerto${hits === 1 ? "" : "s"}`}
                            {won ? " — premiado!" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="manage-section">
          <h2>Jogos fixos em {active.label}</h2>

          {gamesForActive.length === 0 && (
            <p className="empty">
              Nenhum jogo cadastrado ainda pra {active.label}. Adicione abaixo.
            </p>
          )}

          <ul className="game-list">
            {gamesForActive.map((g) => (
              <li key={g.id} className="game-item">
                <div className="result-numbers">
                  {g.numbers.map((n) => (
                    <span className="chip" key={n}>
                      {String(n).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                {g.label && <span className="result-label">{g.label}</span>}
                <button className="remove" onClick={() => handleRemoveGame(g.id)} aria-label="Remover jogo">
                  remover
                </button>
              </li>
            ))}
          </ul>

          <div className="add-form">
            <p className="add-hint">
              Escolha {active.pick} números entre {active.range[0]} e {active.range[1]}
              {" "}({newNumbers.length}/{active.pick})
            </p>
            <NumberPicker
              range={active.range}
              pick={active.pick}
              selected={newNumbers}
              onChange={setNewNumbers}
            />
            <div className="add-row">
              <input
                type="text"
                placeholder="apelido do jogo (opcional, ex: pai)"
                value={ownerLabel}
                onChange={(e) => setOwnerLabel(e.target.value)}
              />
              <button
                onClick={handleAddGame}
                disabled={newNumbers.length !== active.pick}
              >
                Salvar jogo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Números buscados via API pública de resultados da Caixa. Ferramenta
          independente, sem vínculo com a Caixa Econômica Federal. Seus jogos
          ficam salvos só neste navegador.
        </p>
      </footer>
    </div>
  );
}
