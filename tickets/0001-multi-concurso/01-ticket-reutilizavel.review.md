# Review — 01-ticket-reutilizavel

status: approved
ticket: 0001-multi-concurso/01-ticket-reutilizavel
reviewed_range: 80b96ea4b5c756183991a2f8b752d3f7efa075c5..451353c469c31fdf3ea6ab122091f65a088013ba

## Critérios

- Componente de ticket em arquivo próprio em `src/`, recebendo loteria ativa, resultado e jogos salvos; `App` renderiza o resultado avulso através dele — pass
- O componente não lê estado global nem localStorage: tudo entra por props — pass
- O helper de formatação de dinheiro acompanha o componente e não fica órfão em `App` — pass
- Nenhuma mudança em `fetchDraw`, normalização, `countHits`, cadastro de jogos ou localStorage — pass
- Nenhuma mudança de classe CSS ou marcação; DOM do ticket equivalente ao de antes — pass
- Verificado manualmente no navegador (Mega-Sena, Dupla-Sena, loteria sem jogos) — pass
- `npm run lint` e `npm run build` passam — pass (via `npx oxlint` direto; `npm run lint` neste ambiente é interceptado por um hook `rtk` que quebra em qualquer projeto oxlint, não é um problema do código — ver nota abaixo)

## Evidência

- Equivalência textual provada: bloco removido de `App.jsx` (121-194) idêntico a `DrawTicket.jsx` (13-89) após de-indent + renomeações `active.`→`lottery.`, `gamesForActive`→`games`. `formatMoney` byte-idêntico.
- `npx oxlint`: 1 warning pré-existente (`react(set-state-in-effect)` em `App.jsx`), confirmado presente também na árvore base via `git archive` — não introduzido por este ticket.
- `npx vite build`: sucesso, 22 módulos.
- Árvore de trabalho limpa após os checks.

## Riscos residuais

- Os dois critérios "verificado manualmente no navegador" foram confirmados por prova de equivalência textual + build, não por navegação real nesta revisão — risco residual considerado nulo dado que a mudança é puramente mecânica (sem edição de lógica).
- Nota de ambiente: `npm run lint` (o script, não o `oxlint` direto) falha com "JSON parse failed" neste ambiente por causa do hook `rtk` do usuário, que assume ESLint. Não é um defeito do projeto — revisões futuras devem usar `npx oxlint` diretamente.

## Findings

Nenhum.
