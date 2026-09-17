# 03: Intervalo salva cada concurso e aproveita os que já estão salvos

**What to build:** o modo "Intervalo" passa a obedecer à mesma regra dos
outros modos: cada concurso do lote buscado com sucesso é salvo, e um
concurso que já está salvo aparece na hora, sem requisição. Repetir um
intervalo que cobre concursos já buscados fica bem mais rápido, e só os que
faltam vão à rede.

O resto do comportamento do intervalo não muda: a lista sai na ordem do
concurso inicial ao final misturando salvos e recém-buscados, o progresso
conta todos os concursos pedidos, e um concurso indisponível continua virando
erro inline sem derrubar os outros — e sem ser salvo.

**Blocked by:** 02 (Buscar de novo um concurso salvo não chama a API).

**Spec:** `docs/specs/0002-concursos-pesquisados.md` — "Implementation
Decisions › Novo módulo: concursos salvos" (`getDrawRange`) e "Testing
Decisions". **ADRs:** nenhum; ver `docs/CONTEXT.md` (falha de um concurso não
aborta o restante, teto de 25 por busca, e a decisão de carregar do que já
está salvo também dentro de um intervalo).

- [ ] A orquestração do lote sai de `api.js` e passa para o módulo de
      concursos salvos, que para cada concurso usa o salvo ou busca e salva.
      `api.js` fica só com a busca de um concurso e a normalização, sem
      mudança de comportamento.
- [ ] A mensagem de erro por item do intervalo acompanha a orquestração para
      o módulo novo, com o mesmo texto de hoje; a mensagem de erro do modo de
      um concurso só continua intacta.
- [ ] Os testes de lote que hoje moram no teste de `api.js` acompanham a
      mudança de módulo, sem perder nenhum caso.
- [ ] Cada concurso do intervalo buscado com sucesso fica salvo e passa a
      aparecer na lista de concursos salvos da loteria ativa.
- [ ] Um concurso do intervalo que já está salvo não dispara requisição.
- [ ] Um intervalo repetido inteiro não dispara nenhuma requisição.
- [ ] Concurso do intervalo que falha continua virando item de erro inline na
      posição dele, os demais seguem, e o que falhou não é salvo.
- [ ] A lista sai sempre na ordem do intervalo (menor para maior),
      independentemente de quais vieram do salvo e quais foram buscados.
- [ ] O callback de progresso é chamado uma vez por concurso pedido,
      inclusive para os que vieram do salvo, e o total continua sendo o
      tamanho do intervalo.
- [ ] A forma dos itens não muda: `{ concurso, status: "ok", draw }` e
      `{ concurso, status: "erro", message }`.
- [ ] Validação de intervalo, teto de 25, exclusividade entre resultado
      avulso e lista de intervalo, e limpeza ao trocar de loteria continuam
      como estão.
- [ ] Testes de vitest: lote com parte dos concursos já salvos chama `fetch`
      só para os que faltam, devolve um item por concurso pedido na ordem do
      intervalo e chama o progresso uma vez por concurso; lote com um
      concurso que falha produz item de erro na posição dele, mantém os
      demais e não salva o que falhou.
- [ ] Teste e2e: um intervalo buscado duas vezes dispara requisições só na
      primeira e mostra a mesma lista nas duas; os concursos do intervalo
      aparecem na lista de concursos salvos.
- [ ] `npm run lint`, `npm run build`, `npm test` e `npm run test:e2e`
      passam.
