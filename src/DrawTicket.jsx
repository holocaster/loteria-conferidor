import { countHits } from "./lotteries";

function formatMoney(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.startsWith("R$") ? value : `R$ ${value}`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Ticket de um concurso: cabeçalho, dezenas (e o 2º sorteio da Dupla-Sena),
// aviso de acumulado e a conferência dos jogos salvos da loteria ativa.
// Sem estado próprio nem leitura de localStorage — tudo entra por props,
// para poder ser renderizado N vezes com concursos diferentes.
export default function DrawTicket({ lottery, draw, games }) {
  return (
    <div className="ticket" style={{ "--accent": lottery.color }}>
      <div className="ticket-head">
        <span>{lottery.label}</span>
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

      {games.length > 0 && (
        <div className="results">
          <h3>Seus jogos nesse concurso</h3>
          {games.map((g) => {
            const hits = countHits(g.numbers, draw.dezenas);
            const hits2 = draw.dezenasSegundo
              ? countHits(g.numbers, draw.dezenasSegundo)
              : null;
            const won =
              hits >= lottery.prizeFrom ||
              (hits2 !== null && hits2 >= lottery.prizeFrom);
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
  );
}
