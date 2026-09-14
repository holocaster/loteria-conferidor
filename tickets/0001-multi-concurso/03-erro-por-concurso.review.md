# Review — 03-erro-por-concurso

status: approved
ticket: 0001-multi-concurso/03-erro-por-concurso
reviewed_range: 3d90a37ac3b4c5c12ee33f399dd944ce633e4182..a2451a256a50f7f0996b93e31ac05cf921042696

Último ticket da feature 0001-multi-concurso. Aprovado sem findings bloqueantes.

## Critérios

Todos pass, exceto "verificado manualmente no navegador (intervalo passando do último concurso sorteado)" — `not_verified` pelo reviewer (sem browser no ambiente dele). Fechado por mim depois, ver abaixo.

## Sugestões não-bloqueantes (registradas, não exigem ação)

1. `fetchDrawRange` colapsa qualquer falha de `fetchDraw` (rede offline, DNS, 400/404, formato inesperado) na mesma mensagem "não disponível", e descarta o erro original sem logar — um bug real de normalização apareceria pra pessoa como "ainda não sorteado". Robustez de diagnóstico, não critério de aceitação.
2. Os testes novos de `fetchDrawRange` não passam `onProgress`, então uma regressão que movesse o callback pra dentro do `try` não seria pega pela suíte.

## Checks (todos passaram)

- `npx vitest run`: 15 testes.
- `npx oxlint`: exit 0, só o warning pré-existente (confirmado idêntico no base via worktree descartável).
- `npm run build`: sucesso.
- Probe externo do reviewer: progresso dispara pra itens de erro (incluindo primeiro e último), rejeição de rede também vira item de erro.

## Verificação manual final (fechada por mim, não pelo reviewer)

Testado ao vivo no navegador contra a API real: intervalo 3055-3060 na Mega-Sena (concurso mais recente real é 3057) com um jogo salvo (01-02-03-04-05-06). Resultado: 3055/3056/3057 renderizados como tickets normais com a conferência do jogo (1, 0 e 2 acertos respectivamente); 3058/3059/3060 (ainda não sorteados) aparecem como linhas de erro inline em vermelho, na posição certa da lista, sem interromper os demais itens.

## Feature 0001-multi-concurso: completa

Os três tickets (extração do componente, modo de intervalo, isolamento de falha) estão aprovados e verificados manualmente no navegador contra a API real da Caixa, cobrindo: busca de intervalo simples, teto de 25, validação de ordem invertida, Dupla-Sena com dois sorteios no intervalo, troca de loteria durante busca em andamento (bug encontrado e corrigido na revisão do ticket 02), erro inline por concurso indisponível, e layout mobile.
