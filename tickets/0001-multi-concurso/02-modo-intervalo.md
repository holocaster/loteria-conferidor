# 02: Modo "de/até": buscar um intervalo de concursos e conferir os jogos

**What to build:** o terceiro modo de busca na seção "Conferir sorteio".
A pessoa preenche "de" e "até", clica em buscar e recebe uma lista de tickets
empilhados — um por concurso, do inicial ao final, cada um com as dezenas
sorteadas daquele concurso e a conferência de todos os jogos fixos salvos da
loteria ativa. Enquanto a busca roda, ela vê o progresso e os tickets já
resolvidos aparecendo.

Antes de qualquer requisição, o intervalo é validado: final menor que
inicial é recusado, e mais de 25 concursos é recusado, com mensagem de erro
na tela e nenhuma busca disparada. O app nunca inverte nem corta os valores
digitados.

Este ticket cobre o caminho em que todos os concursos do intervalo
respondem. Um concurso que falha ainda derruba a busca inteira com a
mensagem de erro que já existe hoje — comportamento provisório, fechado no
ticket 03.

**Blocked by:** 01 (Extrair o ticket de concurso para um componente
reutilizável).

**Spec:** `docs/specs/0001-multi-concurso.md` — "Implementation Decisions ›
Novo módulo: validação de intervalo", "› API: busca em lote", "› Estado e
interação na tela", e "Testing Decisions". **ADRs:** nenhum; ver
`docs/CONTEXT.md` (Concurso, teto de 25 por busca).

- [ ] A seção "Conferir sorteio" tem um terceiro modo com dois campos
      numéricos independentes ("de" e "até") e seu próprio botão, ao lado dos
      dois modos existentes, que continuam funcionando sem mudança.
- [ ] Existe um módulo de validação de intervalo, puro (sem `fetch`, sem
      React), que recebe os dois valores digitados e devolve ou a lista de
      concursos a buscar, ou uma recusa com mensagem em pt-BR.
- [ ] A lista de concursos é inclusiva nas duas pontas: "de" igual a "até"
      produz um concurso; 3090 a 3094 produz cinco.
- [ ] Intervalo com final menor que o inicial é recusado com mensagem, e
      nenhuma requisição é feita. Os valores não são invertidos.
- [ ] Intervalo maior que 25 concursos é recusado com mensagem que cita o
      limite e o tamanho pedido, e nenhuma requisição é feita. Exatamente 25
      concursos é aceito; 26 é recusado.
- [ ] O teto de 25 é uma constante exportada pelo módulo de validação, usada
      pela mensagem de erro — o número não aparece duplicado como literal na
      tela.
- [ ] Valores vazios, não inteiros ou menores que 1 são recusados sem
      requisição; o botão fica desabilitado enquanto os dois campos não
      estiverem preenchidos ou enquanto houver busca em andamento.
- [ ] O módulo de API ganha uma busca em lote que recebe a loteria e a lista
      de concursos já validada, busca **sequencialmente** reutilizando
      `fetchDraw` (um fetch por concurso, sem endpoint em lote), e reporta
      cada concurso resolvido por callback de progresso.
- [ ] Cada concurso resolvido vira um item de resultado com forma estável
      `{ concurso, status, ... }`, e a lista final tem um item por concurso
      pedido, sempre na ordem do intervalo (menor para maior).
- [ ] `fetchDraw`, a normalização da resposta e a mensagem de erro do modo de
      um concurso só não mudam.
- [ ] Cada concurso do intervalo é renderizado pelo componente de ticket do
      ticket 01, com o layout reusado como está (incluindo aviso de acumulado
      e o título por item), e com o tratamento de Dupla-Sena preservado: 1º e
      2º sorteios com suas dezenas e contagens de acertos separadas.
- [ ] Durante a busca há um indicador de progresso em concursos (quantos de
      quantos) e os itens já resolvidos aparecem na tela conforme chegam.
- [ ] Resultado de intervalo e resultado avulso são mutuamente exclusivos:
      iniciar uma busca de intervalo limpa o resultado avulso; "Buscar
      concurso" e "Usar o último sorteio" limpam a lista do intervalo.
- [ ] Trocar de loteria limpa a lista do intervalo e os campos "de"/"até",
      junto com o que a troca de loteria já limpa hoje.
- [ ] `vitest` é adicionado como dependência de desenvolvimento com script de
      teste no `package.json`, em ambiente node — sem jsdom, sem
      testing-library, sem teste de componente React.
- [ ] Testes cobrem a validação de intervalo: lista inclusiva, `de == até`,
      exatamente 25 aceito, 26 recusado, final menor que inicial recusado,
      entradas vazias / não numéricas / menores que 1 recusadas.
- [ ] Testes cobrem a busca em lote com `fetch` global substituído por um
      duplo: todos os concursos OK produzem itens na ordem do intervalo, um
      item por concurso pedido, e o callback de progresso é chamado uma vez
      por concurso.
- [ ] Verificado manualmente no navegador: intervalo de cinco concursos de
      uma loteria com jogos salvos mostra cinco tickets empilhados e legíveis
      no celular; o mesmo intervalo em Dupla-Sena mostra os dois sorteios por
      concurso; uma loteria sem jogos salvos mostra só as dezenas.
- [ ] Sem cache entre buscas e sem persistir o último intervalo digitado.
- [ ] `npm run lint`, `npm run build` e a suíte de testes passam.
