status: approved
ticket: 0002-concursos-pesquisados / 03-intervalo-aproveita-salvos
reviewed_range: ddc29f3244c99f7b92c3507495ee85e141ff844e..7b458e5f5d363e5fe9be08be4e770156e571aec0

criteria:
  - criterion: "Orquestração do lote sai de api.js e vai para o módulo de concursos salvos; api.js fica só com fetchDraw + normalização, sem mudança de comportamento"
    result: pass
  - criterion: "Mensagem de erro por item acompanha a orquestração, com o mesmo texto; mensagem do modo avulso intacta"
    result: pass
  - criterion: "Testes de lote acompanham a mudança de módulo, sem perder nenhum caso"
    result: pass
  - criterion: "Cada concurso do intervalo buscado com sucesso fica salvo e aparece na lista de concursos salvos"
    result: pass
  - criterion: "Concurso já salvo não dispara requisição / intervalo repetido inteiro não dispara nenhuma"
    result: pass
  - criterion: "Concurso que falha vira erro inline na posição dele, os demais seguem, e o que falhou não é salvo"
    result: pass
  - criterion: "Lista sempre na ordem do intervalo, misturando salvos e buscados"
    result: pass
  - criterion: "Progresso chamado uma vez por concurso pedido, inclusive os vindos do salvo; total = tamanho do intervalo"
    result: pass
  - criterion: "Forma dos itens não muda ({concurso,status:'ok',draw} / {concurso,status:'erro',message})"
    result: pass
  - criterion: "Validação de intervalo, teto de 25, exclusividade avulso/intervalo e limpeza ao trocar de loteria continuam como estão"
    result: pass
  - criterion: "Testes vitest e e2e exigidos pelo ticket"
    result: pass
  - criterion: "npm run lint, build, test, test:e2e passam"
    result: pass

findings:
  - severity: suggestion
    location: CLAUDE.md:32 (seção Architecture, bullet de src/api.js)
    impact: >
      Documentação descreve fetchDrawRange() como morador de src/api.js
      (onde não existe mais) e não menciona src/savedDraws.js, dono atual
      da política saved-first e da orquestração do lote. Fora dos critérios
      deste ticket - defasagem nasceu nos tickets 01/02, o 03 só tornou a
      linha factualmente falsa. Não altera o veredito.
    required_change: >
      Atualizar o bullet de src/api.js e acrescentar src/savedDraws.js na
      seção Architecture do CLAUDE.md como tarefa de fechamento da feature
      0002 (orquestrador), não como correção deste ticket.
  - severity: suggestion
    location: e2e/busca.spec.js:89-93 (segunda rodada do intervalo)
    impact: >
      Risco residual de flake nas asserções de conteúdo pós-segundo-clique;
      a prova real do critério (requestCount estável) já é válida.
    required_change: "Opcional: ancorar num sinal do novo ciclo antes de reasserir os 3 itens."

residual_risks:
  - "Concurso salvo com rateio ainda não publicado continua servido assim até ser apagado e rebuscado - Out of Scope já na spec."
  - "getDrawRange colapsa qualquer falha de getDraw na mensagem 'não disponível', descartando o erro original - comportamento idêntico ao pré-migração, sem regressão."

checks:
  - "npm run lint: 1 warning pré-existente, idêntico ao commit base."
  - "npm run build: OK."
  - "npm test: 57 testes, 5 arquivos, todos verdes."
  - "npm run test:e2e: 23/23 verdes, incluindo o novo fluxo de intervalo repetido."
  - "grep confirma zero consumidor órfão de fetchDrawRange; draw.raw não é consumido em produção."
  - "git status --porcelain vazio ao fim - árvore igual ao commit revisado."

summary: >
  Migração de fetchDrawRange (renomeada getDrawRange) para savedDraws.js
  completa e correta. Todos os critérios do ticket - e último da feature -
  verificados. Zero findings blocking ou important. Feature 0002-concursos-
  pesquisados completa.
