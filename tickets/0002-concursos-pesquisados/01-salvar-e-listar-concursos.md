# 01: Concurso buscado fica salvo e aparece numa lista dentro do card

**What to build:** quando a pessoa busca um concurso com sucesso (modo
"Concurso específico" ou "Último sorteio"), o resultado completo passa a ser
guardado no navegador sozinho, sem nenhum botão de salvar. Dentro do card
"Conferir sorteio" aparece um bloco recolhível "Concursos salvos (N)" com os
concursos salvos da loteria ativa. Clicar num item reabre o ticket daquele
concurso, conferido contra os jogos fixos atuais; cada item tem um botão
para apagar só ele.

Concurso que falhou não é salvo — o erro na tela continua exatamente como é
hoje e nada entra na lista.

Este ticket ainda **não** muda o que a busca faz: buscar de novo um concurso
já salvo continua chamando a API (fechado no ticket 02), e o modo
"Intervalo" continua sem salvar nada (fechado no ticket 03).

**Blocked by:** None (can start immediately).

**Spec:** `docs/specs/0002-concursos-pesquisados.md` — "Implementation
Decisions › Novo módulo: concursos salvos", "› Formato do concurso salvo",
"› Lista de concursos salvos na tela" e "Testing Decisions". **ADRs:**
nenhum; ver `docs/CONTEXT.md` (termo "Concurso salvo" e as decisões sobre
salvar automaticamente, apagar por item e sem limite).

- [ ] Existe um módulo novo de concursos salvos, dono da persistência e da
      política de saved-first. `storage.js` (jogos fixos) e `api.js` (rede,
      URL, normalização) continuam com as responsabilidades que já têm.
- [ ] Os concursos salvos usam uma chave própria no `localStorage`, irmã da
      dos jogos fixos — apagar concurso salvo nunca pode afetar jogo fixo.
- [ ] Um registro salvo é `{ slug, concurso, draw }` com `concurso` numérico;
      identidade é (loteria, concurso), e salvar um concurso já salvo
      sobrescreve em vez de duplicar.
- [ ] O `draw` salvo guarda os campos normalizados que o ticket usa (dezenas,
      dezenas do 2º sorteio, data, acumulou, valores do próximo concurso,
      rateio de prêmio) e **não** guarda o campo `raw`.
- [ ] Buscar um concurso avulso com sucesso salva o resultado; buscar o
      "último sorteio" com sucesso também salva, pelo número de concurso que
      voltou.
- [ ] Busca que falha (HTTP 500 ou formato inesperado) propaga o erro como
      hoje e não salva nada.
- [ ] Leitura defensiva: chave ausente ou com JSON corrompido devolve lista
      vazia em vez de estourar, igual aos jogos fixos.
- [ ] Gravação é best-effort: se o `localStorage` recusar a escrita, a busca
      ainda devolve e mostra o resultado normalmente, sem erro de tela.
- [ ] O card "Conferir sorteio" ganha um bloco recolhível com a contagem no
      título (ex: "Concursos salvos (7)"), recolhido por padrão, abaixo dos
      controles de busca.
- [ ] O bloco não aparece quando a loteria ativa não tem nenhum concurso
      salvo.
- [ ] A lista mostra só os concursos salvos da loteria ativa e troca de
      conteúdo ao trocar de aba de loteria, igual à lista de jogos fixos.
- [ ] Cada item mostra o número do concurso e a data, ordenados do maior
      número de concurso para o menor.
- [ ] Clicar num item abre aquele concurso no resultado avulso da tela, pelo
      mesmo componente de ticket usado no resto do app, conferido contra os
      jogos fixos **atuais** da loteria ativa — incluindo jogos cadastrados
      depois de o concurso ter sido salvo.
- [ ] Abrir um concurso salvo respeita a exclusividade mútua já existente:
      limpa a lista de intervalo, e uma busca nova limpa o que foi aberto.
- [ ] Cada item tem um botão de apagar, sem confirmação (igual ao "remover"
      de jogo fixo), que remove só aquele registro e não mexe nos outros nem
      nos jogos fixos.
- [ ] Apagar um concurso salvo que está aberto na tela não fecha o ticket
      aberto — o concurso só sai da lista.
- [ ] A lista na tela reflete as escritas sem recarregar a página: uma busca
      nova acrescenta o item, apagar tira o item.
- [ ] Sem nova aba no seletor mobile e sem mudança no layout de duas colunas;
      a lista é legível e clicável no celular.
- [ ] Sem limite de quantidade, sem eviction e sem expiração.
- [ ] Testes de vitest do módulo novo, com `localStorage` e `fetch` globais
      stubados (arte prévia: `storage.test.js` e `api.test.js`): busca com
      sucesso salva; busca que falha não salva; salvar o mesmo concurso duas
      vezes sobrescreve sem duplicar; registros são escopados por loteria
      (mesmo número em duas loterias são dois registros); apagar remove só o
      pedido; JSON corrompido devolve lista vazia; `setItem` que lança não
      impede a busca de devolver o resultado.
- [ ] Testes e2e (`page.route`, arte prévia em `e2e/busca.spec.js`): o
      concurso buscado aparece na lista de salvos da loteria ativa; clicar
      nele reabre o ticket conferido contra um jogo cadastrado **depois** de
      o concurso ter sido salvo; apagar remove só aquele item; um concurso
      que respondeu 500 não aparece na lista.
- [ ] Tudo que o app já fazia continua igual: os três modos de busca, o erro
      inline por concurso do intervalo, e o cadastro/remoção de jogos fixos.
- [ ] `npm run lint`, `npm run build`, `npm test` e `npm run test:e2e`
      passam.
