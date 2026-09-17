# Tickets: 0002-concursos-pesquisados

Spec: `docs/specs/0002-concursos-pesquisados.md`

| # | Title | Blocked by | Status |
|---|-------|-----------|--------|
| 01 | Concurso buscado fica salvo e aparece numa lista dentro do card | none | done |
| 02 | Buscar de novo um concurso salvo não chama a API | 01 | done |
| 03 | Intervalo salva cada concurso e aproveita os que já estão salvos | 02 | ready |

01 é o tracer bullet: persistência, salvamento automático no modo avulso e
no último sorteio, e a lista recolhível com reabrir e apagar. 02 fecha a
leitura — buscar de novo um concurso salvo deixa de chamar a API, com a
exceção do último sorteio. 03 leva a mesma regra para o modo intervalo e traz
a orquestração do lote para o módulo de concursos salvos.
