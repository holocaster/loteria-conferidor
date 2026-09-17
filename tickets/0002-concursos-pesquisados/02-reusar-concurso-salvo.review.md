status: approved
ticket: 0002-concursos-pesquisados / 02-reusar-concurso-salvo
reviewed_range: a48a766dbc4ea53c6e389af109f0fc2955a43822..4c3adfac9568bae15f12adf0e985d0b61287cf40

criteria:
  - criterion: "Módulo de concursos salvos expõe busca que consulta o salvo primeiro e só chama a rede quando não há registro; App usa essa entrada no modo 'Concurso específico'"
    result: pass
  - criterion: "Buscar um concurso já salvo não dispara nenhuma requisição e mostra o mesmo ticket"
    result: pass
  - criterion: "Buscar um concurso ainda não salvo chama a API uma vez e salva o resultado"
    result: pass
  - criterion: "Número digitado vem como string e o salvo é numérico; comparação coagida a número, coberta por teste"
    result: pass
  - criterion: "O salvo de uma loteria nunca é servido para outra, nem com o mesmo número de concurso"
    result: pass
  - criterion: "'Último sorteio' sempre chama a API, mesmo com o concurso já salvo"
    result: pass
  - criterion: "A resposta do 'Último sorteio' sobrescreve o registro salvo, sem duplicar"
    result: pass
  - criterion: "Erro na busca propaga como hoje e não cria nem altera registro salvo; indisponível não trava como erro"
    result: pass
  - criterion: "Ticket servido do salvo não ganha marcação visual de origem"
    result: pass
  - criterion: "Testes vitest (4 cenários exigidos)"
    result: pass
  - criterion: "Testes e2e com contagem de requisições (2 cenários exigidos)"
    result: pass
  - criterion: "Modo 'Intervalo' inalterado (sem salvar, sem aproveitar salvos)"
    result: pass
  - criterion: "npm run lint, build, test, test:e2e passam"
    result: pass

findings:
  - severity: suggestion
    location: src/savedDraws.js (record, removeSavedDraw, findSaved)
    impact: >
      Predicado de identidade (slug + Number(concurso)) duplicado em três
      funções. Custo atual baixo (arquivo de 70 linhas).
    required_change: "Opcional: extrair predicado único reutilizado nas três."
  - severity: suggestion
    location: e2e/busca.spec.js:181
    impact: >
      A asserção de "mostrou de novo" é satisfeita pelo ticket que já estava
      na tela; o valor real do teste está no requestCount, que está correto.
    required_change: "Opcional: tornar o segundo clique observável (trocar de modo antes, ou concursos alternados)."
  - severity: suggestion
    location: src/savedDraws.js:30-36 (record) - fora do escopo deste ticket
    impact: >
      Pré-existente do ticket 01: payload sem campo de concurso vira NaN,
      dedupe nunca casa, registro gravado como concurso:null poderia ser
      servido para busca pelo concurso '0'. Não observado nas loterias
      suportadas; não altera o veredito.
    required_change: "Se o orquestrador quiser rotear: validar/descartar registro sem concurso numérico antes de gravar."

residual_risks:
  - "e2e depende do glob de rota do Playwright para isolar 'último sorteio' de 'concurso específico' - funciona hoje, sutileza a lembrar no ticket 03."

checks:
  - "npm run lint: 1 warning pré-existente (react/set-state-in-effect, App.jsx não tocado neste diff)."
  - "npm test: 55 testes, 5 arquivos, todos verdes."
  - "npm run build: OK."
  - "npm run test:e2e: 22/22 verdes, incluindo os 2 novos."
  - "Diff restrito a savedDraws.js/.test.js e busca.spec.js - sem scope creep."
  - "Intervalo continua chamando fetchDrawRange de api.js diretamente, como exigido - migração fica para o ticket 03."

summary: >
  Saved-first implementado em getDraw; getLatestDraw já estava correto
  (sempre busca, overwrite via record()). Zero findings blocking ou
  important, três suggestions opcionais.
