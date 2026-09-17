# 02: Buscar de novo um concurso salvo não chama a API

**What to build:** no modo "Concurso específico", buscar um concurso que já
está salvo passa a mostrar o resultado direto do que está guardado, sem
nenhuma requisição — resposta imediata, e funciona mesmo com a API da Caixa
fora do ar. Um concurso que ainda não está salvo é buscado e salvo como no
ticket 01.

O modo "Último sorteio" é a exceção: sempre vai à API, porque pode ter saído
um sorteio novo desde a última vez. A resposta atualiza o concurso salvo
correspondente (sobrescreve, não duplica).

Nada muda visualmente: o ticket de um concurso servido do salvo é idêntico
ao de um recém-buscado, sem selo nem rótulo.

**Blocked by:** 01 (Concurso buscado fica salvo e aparece numa lista dentro
do card).

**Spec:** `docs/specs/0002-concursos-pesquisados.md` — "Implementation
Decisions › Novo módulo: concursos salvos" (`getDraw`, `getLatestDraw`),
"› Formato do concurso salvo" e "Testing Decisions". **ADRs:** nenhum; ver
`docs/CONTEXT.md` (decisão sobre carregar do que já está salvo e a exceção
do último sorteio).

- [ ] O módulo de concursos salvos expõe a busca de um concurso que consulta
      o salvo primeiro e só chama a rede quando não há registro; `App` usa
      essa entrada no lugar da chamada direta à API no modo "Concurso
      específico".
- [ ] Buscar um concurso já salvo não dispara **nenhuma** requisição e mostra
      o mesmo ticket de antes.
- [ ] Buscar um concurso ainda não salvo chama a API uma vez e salva o
      resultado.
- [ ] O número digitado chega como string e o número salvo é numérico: a
      busca do salvo compara os dois lados coagidos a número, e isso é
      coberto por teste.
- [ ] O concurso salvo de uma loteria nunca é servido para outra loteria, nem
      quando o número do concurso coincide.
- [ ] O modo "Último sorteio" sempre chama a API, mesmo quando o concurso que
      vai voltar já está salvo.
- [ ] A resposta do "Último sorteio" sobrescreve o registro salvo daquele
      concurso, sem criar um segundo registro.
- [ ] Erro na busca continua propagando como hoje e não cria nem altera
      registro salvo; um concurso indisponível não fica travado como erro.
- [ ] O ticket servido do salvo não ganha nenhuma marcação visual de origem.
- [ ] Testes de vitest: buscar duas vezes o mesmo concurso chama `fetch` uma
      vez só; concurso pedido como string acha o registro gravado com número;
      "último sorteio" chama `fetch` mesmo com o concurso já salvo e o
      registro passa a refletir a resposta nova; salvo de uma loteria não é
      devolvido para outra.
- [ ] Testes e2e com contagem de requisições (padrão da flag `requested` em
      `e2e/busca.spec.js`): buscar o mesmo concurso duas vezes dispara uma
      requisição só e mostra o ticket nas duas; "Ver último sorteio" dispara
      requisição mesmo com o concurso já salvo.
- [ ] O modo "Intervalo" continua com o comportamento de hoje (sem salvar e
      sem aproveitar salvos) — fechado no ticket 03.
- [ ] `npm run lint`, `npm run build`, `npm test` e `npm run test:e2e`
      passam.
