# 0002 — Concursos salvos

## Goal

O usuário não deve precisar repetir uma busca de concurso que já fez antes.
Toda busca bem-sucedida fica salva automaticamente no navegador, e ele pode
apagar concursos salvos que não quer mais guardar.

## Scope

- Ao buscar um concurso com sucesso (avulso, cada concurso de um intervalo,
  ou "último sorteio" quando resolve a um concurso específico), salvar o
  resultado completo (dezenas, data, rateio de prêmio) automaticamente —
  sem ação extra do usuário.
- Ao buscar de novo um concurso já salvo (avulso, ou dentro de um novo
  intervalo), carregar do que já está salvo em vez de chamar a API — exceto
  "último sorteio", que sempre busca na API (pode ter saído um resultado
  novo) e atualiza o concurso salvo correspondente.
- Concursos com erro (HTTP 500 = indisponível, ver `docs/CONTEXT.md`) nunca
  são salvos.
- Lista recolhível de "concursos salvos" dentro do card "Conferir sorteio"
  já existente (não abre nova aba mobile nem muda o layout de 2 colunas).
  Escopada por loteria, igual jogos fixos.
- Apagar concurso salvo, um item por vez, com botão na lista.
- Clicar num concurso salvo reabre pelo `DrawTicket` já usado no resto do
  app, comparando contra os jogos fixos *atuais* daquela loteria (não uma
  foto do momento em que foi salvo).
- Sem limite de quantos concursos ficam salvos.

## Out of scope

- Apagar em lote ou por intervalo salvo como unidade — só item individual.
- Editar um concurso salvo — só inserir (automático) e apagar.
- Sincronizar entre dispositivos/navegadores — mesma limitação de
  `localStorage` que já vale para jogos fixos.
- Atualização automática de um concurso já salvo (dados imutáveis até
  apagar e buscar de novo) e qualquer limite/eviction de quantidade.

## Decisions

Ver `docs/CONTEXT.md` — seção "Language" (termo "Concurso salvo") e as
quatro decisões adicionadas em "Decisions" sobre salvar automaticamente,
cache-first, apagar por item, e sem limite.

## Open questions

Nenhuma — grilagem concluída, todas as ramificações resolvidas.
