# Review — 02-modo-intervalo (rodada 2 — final)

status: approved
ticket: 0001-multi-concurso/02-modo-intervalo
reviewed_range: cfeb367934ca01a6882217f4e3e3006f4c0a18f3..993eb6aefee88159d8de47384582ac93b54e27cd

## Finding da rodada 1 — corrigido

A guarda por `activeSlugRef` cobre as três escritas (`intervalResults`, `intervalProgress`, `error`) e a limpeza final de progresso. Trocar de loteria durante uma busca em andamento não repopula mais a lista antiga contra a loteria nova. Verificado por leitura de código (a spec exclui teste de componente React/DOM deste projeto).

Sugestão da rodada 1 (`intervalProgress` não limpo no sucesso) também endereçada.

## Sugestões não-bloqueantes (novas, não impedem aprovação)

1. A guarda compara só o slug — se a pessoa sair da loteria e voltar antes do lote terminar, o restante do lote volta a escrever na lista (resultado parcial, sem contaminação entre loterias). Opcional: trocar por um contador de geração.
2. `loading` só libera quando o laço inteiro termina; trocar de loteria no meio de um lote longo deixa a loteria nova com os botões desabilitados por um tempo, sem indicação do motivo. Opcional: cancelar o lote na troca.

Nenhuma bloqueia — registradas para consciência futura, não como débito obrigatório.

## Checks (todos passaram)

- `npx vitest run`: 13 testes.
- `npx oxlint`: exit 0, só o warning pré-existente.
- `npx vite build`: sucesso.
- Árvore limpa.

## Critérios

Todos os critérios do ticket — pass. Verificação manual no navegador: `not_verified` (ambiente do reviewer sem browser; lacuna de evidência, não falha).
