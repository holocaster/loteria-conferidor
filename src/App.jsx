import { useEffect, useMemo, useRef, useState } from "react";
import { LOTTERY_LIST, LOTTERIES } from "./lotteries";
import { fetchDrawRange } from "./api";
import { validateIntervalo } from "./intervalValidation";
import { loadGames, addGame, removeGame } from "./storage";
import { getDraw, getLatestDraw, loadSavedDraws, removeSavedDraw } from "./savedDraws";
import NumberPicker from "./NumberPicker";
import DrawTicket from "./DrawTicket";
import "./App.css";

const MODES = [
  { key: "ultimo", label: "Último sorteio" },
  { key: "concurso", label: "Concurso específico" },
  { key: "intervalo", label: "Intervalo" },
];

export default function App() {
  const [activeSlug, setActiveSlug] = useState("megasena");
  const [games, setGames] = useState(loadGames);
  const [mode, setMode] = useState("ultimo");
  const [mobileView, setMobileView] = useState("conferir");
  const [concursoInput, setConcursoInput] = useState("");
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNumbers, setNewNumbers] = useState([]);
  const [ownerLabel, setOwnerLabel] = useState("");
  const [deInput, setDeInput] = useState("");
  const [ateInput, setAteInput] = useState("");
  const [intervalResults, setIntervalResults] = useState([]);
  const [intervalProgress, setIntervalProgress] = useState(null);
  const [savedDraws, setSavedDraws] = useState(() => loadSavedDraws(activeSlug));

  const active = LOTTERIES[activeSlug];

  // Referência sempre atualizada da loteria ativa, lida dentro do callback de
  // progresso de handleFetchRange — o closure da chamada captura a loteria de
  // origem, mas só essa ref reflete uma troca de aba ocorrida no meio da
  // busca. Sem isso, os itens que já estavam em voo continuariam escrevendo
  // em intervalResults/intervalProgress depois da troca, misturando o
  // sorteio de uma loteria com os jogos salvos de outra.
  const activeSlugRef = useRef(activeSlug);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    setMode("ultimo");
    setMobileView("conferir");
    setDraw(null);
    setError(null);
    setConcursoInput("");
    setNewNumbers([]);
    setDeInput("");
    setAteInput("");
    setIntervalResults([]);
    setIntervalProgress(null);
    setSavedDraws(loadSavedDraws(activeSlug));
  }, [activeSlug]);

  const gamesForActive = useMemo(
    () => games.filter((g) => g.slug === activeSlug),
    [games, activeSlug]
  );

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setDraw(null);
    setError(null);
    setIntervalResults([]);
    setIntervalProgress(null);
  }

  async function handleFetch(useLatest) {
    setLoading(true);
    setError(null);
    setIntervalResults([]);
    setIntervalProgress(null);
    try {
      const result = useLatest
        ? await getLatestDraw(active.slug)
        : await getDraw(active.slug, concursoInput);
      setDraw(result);
      setSavedDraws(loadSavedDraws(active.slug));
    } catch (err) {
      setError(err.message);
      setDraw(null);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSaved(item) {
    setError(null);
    setIntervalResults([]);
    setIntervalProgress(null);
    setDraw(item.draw);
  }

  function handleRemoveSaved(concurso) {
    removeSavedDraw(active.slug, concurso);
    setSavedDraws(loadSavedDraws(active.slug));
  }

  async function handleFetchRange() {
    const validated = validateIntervalo(deInput, ateInput);
    if (!validated.ok) {
      setError(validated.message);
      return;
    }
    const requestSlug = active.slug;
    setLoading(true);
    setError(null);
    setDraw(null);
    setIntervalResults([]);
    setIntervalProgress({ done: 0, total: validated.concursos.length });
    try {
      await fetchDrawRange(requestSlug, validated.concursos, (item, done, total) => {
        if (activeSlugRef.current !== requestSlug) return;
        setIntervalResults((prev) => [...prev, item]);
        setIntervalProgress({ done, total });
      });
      if (activeSlugRef.current === requestSlug) {
        setIntervalProgress(null);
      }
    } catch (err) {
      if (activeSlugRef.current === requestSlug) {
        setError(err.message);
        setIntervalResults([]);
        setIntervalProgress(null);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRandomPick() {
    const [min, max] = active.range;
    const pool = [];
    for (let n = min; n <= max; n++) pool.push(n);
    const picked = [];
    while (picked.length < active.pick && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    setNewNumbers(picked.sort((a, b) => a - b));
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
    <div className="shell">
      <header>
        <p className="eyebrow">conferidor de loteria</p>
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
            type="button"
            className={l.slug === activeSlug ? "tab tab-active" : "tab"}
            style={l.slug === activeSlug ? { background: l.color } : undefined}
            onClick={() => setActiveSlug(l.slug)}
          >
            <span className="dot" style={{ background: l.color }} />
            {l.label}
          </button>
        ))}
      </nav>

      <div className="view-switch">
        <button
          type="button"
          className={mobileView === "conferir" ? "view-btn view-active" : "view-btn"}
          onClick={() => setMobileView("conferir")}
        >
          Conferir
        </button>
        <button
          type="button"
          className={mobileView === "jogos" ? "view-btn view-active" : "view-btn"}
          onClick={() => setMobileView("jogos")}
        >
          Meus jogos ({gamesForActive.length})
        </button>
      </div>

      <div className="layout">
        <section
          className={
            mobileView === "conferir" ? "card check-section" : "card check-section mobile-hidden"
          }
        >
          <h2>Conferir sorteio</h2>

          <div className="seg-row">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                className={mode === m.key ? "seg seg-active" : "seg"}
                onClick={() => handleModeChange(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "ultimo" && (
            <button
              type="button"
              className="btn btn-full"
              onClick={() => handleFetch(true)}
              disabled={loading}
            >
              Ver último sorteio
            </button>
          )}

          {mode === "concurso" && (
            <div className="field-row">
              <input
                type="number"
                inputMode="numeric"
                placeholder="nº do concurso"
                value={concursoInput}
                onChange={(e) => setConcursoInput(e.target.value)}
                aria-label="Número do concurso"
              />
              <button
                type="button"
                className="btn"
                onClick={() => handleFetch(false)}
                disabled={loading || !concursoInput}
              >
                Buscar concurso
              </button>
            </div>
          )}

          {mode === "intervalo" && (
            <>
              <div className="field-row">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="de"
                  value={deInput}
                  onChange={(e) => setDeInput(e.target.value)}
                  aria-label="Concurso inicial do intervalo"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="até"
                  value={ateInput}
                  onChange={(e) => setAteInput(e.target.value)}
                  aria-label="Concurso final do intervalo"
                />
                <button
                  type="button"
                  className="btn"
                  onClick={handleFetchRange}
                  disabled={loading || !deInput || !ateInput}
                >
                  Buscar intervalo
                </button>
              </div>
              {intervalProgress && (
                <div className="progress-wrap">
                  <p className="progress-label">
                    {intervalProgress.done}/{intervalProgress.total} concursos
                  </p>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(intervalProgress.done / intervalProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {savedDraws.length > 0 && (
            <details className="saved-draws">
              <summary>Concursos salvos ({savedDraws.length})</summary>
              <ul className="saved-draws-list">
                {savedDraws.map((item) => (
                  <li key={item.concurso} className="saved-draw-item">
                    <button
                      type="button"
                      className="saved-draw-open"
                      onClick={() => handleOpenSaved(item)}
                    >
                      <span>Concurso {item.concurso}</span>
                      {item.draw.data && <span>{item.draw.data}</span>}
                    </button>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveSaved(item.concurso)}
                      aria-label={`Apagar concurso ${item.concurso} salvo`}
                    >
                      apagar
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {loading && mode !== "intervalo" && (
            <p className="status">Buscando resultado…</p>
          )}
          {error && <p className="status status-error">{error}</p>}

          {draw && (
            <DrawTicket lottery={active} draw={draw} games={gamesForActive} />
          )}

          {intervalResults.length > 0 && (
            <div className="interval-list">
              {intervalResults.map((item) =>
                item.status === "ok" ? (
                  <DrawTicket
                    key={item.concurso}
                    lottery={active}
                    draw={item.draw}
                    games={gamesForActive}
                  />
                ) : (
                  <p key={item.concurso} className="status status-error">
                    {item.message}
                  </p>
                )
              )}
            </div>
          )}
        </section>

        <aside className={mobileView === "jogos" ? "sidebar" : "sidebar mobile-hidden"}>
          <div className="card">
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
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveGame(g.id)}
                    aria-label="Remover jogo"
                  >
                    remover
                  </button>
                </li>
              ))}
            </ul>

            <div className="add-form">
              <p className="add-hint">
                <span>
                  Escolha {active.pick} números entre {active.range[0]} e {active.range[1]}
                  {" "}({newNumbers.length}/{active.pick})
                </span>
                <span className="quick-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleRandomPick}>
                    Aleatório
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setNewNumbers([])}
                    disabled={newNumbers.length === 0}
                  >
                    Limpar
                  </button>
                </span>
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
                  type="button"
                  className="btn"
                  onClick={handleAddGame}
                  disabled={newNumbers.length !== active.pick}
                >
                  Salvar jogo
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="foot">
        <p>
          Números buscados via API pública de resultados da Caixa. Ferramenta
          independente, sem vínculo com a Caixa Econômica Federal. Seus jogos
          ficam salvos só neste navegador.
        </p>
      </footer>
    </div>
  );
}
