# 03: Concurso indisponível vira erro inline sem derrubar o resto do intervalo

**What to build:** quando um concurso do intervalo não pode ser buscado —
tipicamente um concurso que ainda não foi sorteado, que a API da Caixa
devolve como HTTP 500 — esse concurso aparece como uma linha de erro no
lugar do ticket dele, identificando de qual concurso se trata. Os demais
concursos do intervalo continuam sendo buscados e mostrados normalmente, na
posição certa da lista.

Fecha o comportamento provisório do ticket 02, em que uma falha em qualquer
concurso derrubava a busca inteira.

**Blocked by:** 02 (Modo "de/até": buscar um intervalo de concursos e
conferir os jogos).

**Spec:** `docs/specs/0001-multi-concurso.md` — "Implementation Decisions ›
API: busca em lote", "› Estado e interação na tela", "Testing Decisions".
**ADRs:** nenhum; ver `docs/CONTEXT.md` ("Concurso inexistente ou ainda não
sorteado é um erro do servidor (HTTP 500), não 404" e "Uma falha em um
concurso do intervalo não aborta o restante").

- [ ] A busca em lote não propaga a falha de um concurso: cada concurso vira
      um item de sucesso ou um item de erro, e a busca segue para os
      seguintes.
- [ ] A lista final continua tendo um item por concurso pedido, na ordem do
      intervalo, independentemente de quais falharam — inclusive quando o
      primeiro ou o último do intervalo falha.
- [ ] A mensagem de erro do item é gerada no módulo de API, em pt-BR, e trata
      HTTP 500 como "não disponível" (ainda não sorteado ou indisponível),
      sem afirmar que o concurso não existe.
- [ ] A mensagem de erro de `fetchDraw`, usada pelo modo de um concurso só,
      continua inalterada.
- [ ] Na tela, um item com erro é renderizado como uma linha de erro inline
      no lugar do ticket, identificando o número do concurso, e não como um
      ticket vazio nem como o erro geral da seção.
- [ ] O indicador de progresso conta os concursos que falharam como
      resolvidos: a busca termina normalmente mesmo com falhas.
- [ ] Testes cobrem, com `fetch` global substituído por um duplo: um concurso
      respondendo HTTP 500 no meio do intervalo produz um item de erro
      naquela posição enquanto os demais permanecem itens de sucesso; um
      intervalo em que todos falham produz uma lista completa só de itens de
      erro sem lançar exceção.
- [ ] Verificado manualmente no navegador: um intervalo que passa do último
      concurso sorteado (ex: últimos três reais + dois futuros) mostra os
      tickets reais e as linhas de erro nas posições certas.
- [ ] `npm run lint`, `npm run build` e a suíte de testes passam.
