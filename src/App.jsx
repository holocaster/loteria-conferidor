import { useEffect, useMemo, useRef, useState } from "react";
import { LOTTERY_LIST, LOTTERIES } from "./lotteries";
import { fetchDraw, fetchDrawRange } from "./api";
import { validateIntervalo } from "./intervalValidation";
import { loadGames, addGame, removeGame } from "./storage";
import NumberPicker from "./NumberPicker";
import DrawTicket from "./DrawTicket";
import "./App.css";

export default function App() {
  const [activeSlug, setActiveSlug] = useState("megasena");
  const [games, setGames] = useState(loadGames);
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
    setDraw(null);
    setError(null);
    setConcursoInput("");
    setNewNumbers([]);
    setDeInput("");
    setAteInput("");
    setIntervalResults([]);
    setIntervalProgress(null);
  }, [activeSlug]);

  const gamesForActive = useMemo(
    () => games.filter((g) => g.slug === activeSlug),
    [games, activeSlug]
  );

  async function handleFetch(useLatest) {
    setLoading(true);
    setError(null);
    setIntervalResults([]);
    setIntervalProgress(null);
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

          <div className="fetch-row">
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
              onClick={handleFetchRange}
              disabled={loading || !deInput || !ateInput}
            >
              Buscar intervalo
            </button>
          </div>

          {loading && !intervalProgress && (
            <p className="status">Buscando resultado…</p>
          )}
          {loading && intervalProgress && (
            <p className="status">
              Buscando concursos… ({intervalProgress.done}/{intervalProgress.total})
            </p>
          )}
          {error && <p className="status status-error">{error}</p>}

          {draw && (
            <DrawTicket lottery={active} draw={draw} games={gamesForActive} />
          )}

          {intervalResults.length > 0 && (
            <div className="interval-list">
              {intervalResults.map((item) => (
                <DrawTicket
                  key={item.concurso}
                  lottery={active}
                  draw={item.draw}
                  games={gamesForActive}
                />
              ))}
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
