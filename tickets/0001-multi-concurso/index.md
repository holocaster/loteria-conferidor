# Tickets: 0001-multi-concurso

Spec: `docs/specs/0001-multi-concurso.md`

| # | Title | Blocked by | Status |
|---|-------|-----------|--------|
| 01 | Extrair o ticket de concurso para um componente reutilizável | none | done |
| 02 | Modo "de/até": buscar um intervalo de concursos e conferir os jogos | 01 | ready |
| 03 | Concurso indisponível vira erro inline sem derrubar o resto do intervalo | 02 | ready |

01 é um prefactor mecânico, sem mudança visível. 02 é o tracer bullet da
feature (validação + busca + lista). 03 fecha a resiliência por concurso que
02 deixa provisória.
