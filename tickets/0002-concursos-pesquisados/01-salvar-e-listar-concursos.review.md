status: approved
ticket: 0002-concursos-pesquisados / 01-salvar-e-listar-concursos
reviewed_range: 538edba0dd774ad0a7b935f473700c48f9d5f8e3..7bb44508fc73dbf0f5080cf124003e837ae2dda5

criteria:
  - criterion: "Módulo novo dono da persistência e da política; storage.js e api.js mantêm responsabilidades"
    result: pass
  - criterion: "Chave própria no localStorage, irmã da dos jogos fixos"
    result: pass
  - criterion: "Registro { slug, concurso, draw } com concurso numérico; identidade (loteria, concurso); sobrescreve"
    result: pass
  - criterion: "draw salvo sem o campo raw"
    result: pass
  - criterion: "Concurso avulso e último sorteio salvam ao ter sucesso"
    result: pass
  - criterion: "Busca que falha propaga o erro e não salva nada"
    result: pass
  - criterion: "Leitura defensiva (chave ausente/JSON corrompido -> lista vazia)"
    result: pass
  - criterion: "Gravação best-effort (setItem que lança não derruba a busca)"
    result: pass
  - criterion: "Bloco recolhível com contagem no título, recolhido por padrão, abaixo dos controles"
    result: pass
  - criterion: "Bloco não aparece sem concursos salvos da loteria ativa"
    result: pass
  - criterion: "Lista escopada pela loteria ativa e troca ao trocar de aba"
    result: pass
  - criterion: "Item mostra concurso e data, ordenados do maior para o menor"
    result: pass
  - criterion: "Clicar abre o concurso no resultado avulso, mesmo DrawTicket, contra os jogos atuais"
    result: pass
  - criterion: "Exclusividade mútua com a lista de intervalo preservada"
    result: pass
  - criterion: "Botão de apagar por item, sem confirmação, sem afetar os outros nem jogos fixos"
    result: pass
  - criterion: "Apagar um concurso aberto não fecha o ticket"
    result: pass
  - criterion: "Lista reflete escritas sem recarregar"
    result: pass
  - criterion: "Sem nova aba mobile, sem mudança no layout de duas colunas"
    result: pass
  - criterion: "Sem limite, eviction ou expiração"
    result: pass
  - criterion: "Testes vitest do módulo (7 casos exigidos)"
    result: pass
  - criterion: "Testes e2e (4 fluxos exigidos)"
    result: pass
  - criterion: "Nada do que o app já fazia regrediu"
    result: pass
  - criterion: "lint, build, test, test:e2e passam"
    result: pass

findings:
  - severity: suggestion
    location: src/App.jsx:78-82 (handleFetch)
    impact: >
      Trocar de aba de loteria com uma busca avulsa em voo faz a continuação
      usar o closure antigo (active.slug) e sobrescrever savedDraws com a
      lista da loteria abandonada. Pré-existente (mesma raiz do setDraw
      obsoleto), o diff só estende a corrida a mais um estado.
    required_change: >
      Opcional, melhor como ticket próprio: guardar requestSlug e sair cedo
      se activeSlugRef.current !== requestSlug antes de setDraw/setSavedDraws.
  - severity: suggestion
    location: src/savedDraws.test.js:88-102
    impact: >
      "Apagar concurso salvo nunca afeta jogo fixo" não tem teste direto,
      só é garantido por inspeção da chave localStorage separada.
    required_change: >
      Acrescentar caso que salve um jogo fixo (storage.addGame) e confirme
      que loadGames() sobrevive a removeSavedDraw.
  - severity: suggestion
    location: src/savedDraws.js:28 (função record)
    impact: "Nome-substantivo numa API de verbos (loadSavedDraws, removeSavedDraw)."
    required_change: "Cosmético: renomear para saveDraw/upsertDraw."

residual_risks:
  - "loadAll() não se protege de um valor válido não-array na mesma chave — paridade intencional com storage.js, não é finding."
  - "Number(draw.concurso) viraria NaN se a API devolvesse dezenas sem concurso; não observado nas loterias suportadas, fora dos critérios do ticket."

checks:
  - "npm run lint: 1 warning pré-existente (react/set-state-in-effect, verificado idêntico em 538edba), nenhum novo."
  - "npm test: 5 arquivos, 51 testes verdes (43 antes do ticket)."
  - "npm run build: sucesso."
  - "npm run test:e2e: 20/20 verdes, incluindo os 4 fluxos novos."

summary: >
  Implementado fiel ao recorte do ticket, incluindo não implementar
  saved-first neste incremento (fica para o ticket 02). Sem scope creep:
  api.js, storage.js e fetchDrawRange intactos. Zero findings blocking ou
  important.
