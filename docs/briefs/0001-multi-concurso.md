# 0001 — Buscar intervalo de concursos

## Objetivo

Hoje o app só confere os jogos salvos contra um concurso por vez (o mais
recente, ou um número específico digitado). A pessoa quer poder informar um
intervalo (ex: do concurso 3090 ao 3098) e ver a conferência contra todos
eles de uma vez, sem repetir a busca manualmente concurso a concurso.

## Escopo

- Terceiro modo de busca na seção "Conferir sorteio", ao lado dos dois
  existentes ("Buscar concurso" / "Usar o último sorteio"): dois campos
  numéricos, "de" e "até".
- Ao buscar, valida antes de fazer qualquer requisição:
  - "até" não pode ser menor que "de" → erro de validação, nenhuma busca é
    feita.
  - intervalo (até - de + 1) não pode passar de 25 concursos → erro de
    validação, nenhuma busca é feita.
- Busca cada concurso do intervalo individualmente (mesmo endpoint/loteria
  já usado hoje, um fetch por concurso — sem novo endpoint em lote).
- Resultado: uma lista de tickets empilhados, um por concurso, reaproveitando
  o layout de ticket já existente (bolas sorteadas + conferência de cada
  jogo salvo daquela loteria, incluindo o caso de dois sorteios da
  Dupla-Sena).
- Concurso que falha dentro do intervalo (ex: ainda não sorteado — API
  retorna HTTP 500 pra concurso futuro/inexistente) aparece como uma linha
  de erro inline no lugar do ticket dele; os demais concursos do intervalo
  seguem sendo mostrados normalmente.

## Fora de escopo

- Cache entre buscas (cada busca de intervalo refaz todos os fetches, sem
  guardar resultado de concursos já vistos).
- Escolher jogos específicos para conferir (continua conferindo todos os
  jogos salvos da loteria ativa, como já é hoje).
- Persistir o último intervalo digitado.
- Visão agregada/resumo por jogo através do intervalo (ex: "melhor
  resultado no intervalo") — só a lista concurso a concurso.
- Qualquer mudança no backend/proxy — segue 100% client-side, um fetch por
  concurso direto pro navegador, como hoje.

## Decisões já fechadas na descoberta

- Dois campos numéricos ("de"/"até"), não um campo de texto único tipo
  "3090-3098".
- Teto de 25 concursos por busca — decisão de produto (evitar tela poluída
  e buscas acidentalmente enormes), não limite técnico da API (sem rate
  limit observado em rajadas pequenas/moderadas de requisições sequenciais,
  testado diretamente).
- Intervalo inválido (fim < início, ou > 25 concursos) é rejeitado com erro
  de validação antes de qualquer requisição — nunca corta silenciosamente
  nem troca os valores de posição.
- Falha em um concurso do lote não aborta os demais; aparece como erro
  inline naquele item da lista.

Ver `docs/CONTEXT.md` para o glossário (Concurso, Dezena, Jogo fixo,
Dupla-Sena, Acerto) e as decisões cross-cutting sobre a API de resultados.

## Perguntas em aberto

Nenhuma — árvore de decisão fechada na descoberta (`grilling`).
