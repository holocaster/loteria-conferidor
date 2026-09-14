# Review — 02-modo-intervalo (rodada 1)

status: changes_requested
ticket: 0001-multi-concurso/02-modo-intervalo
reviewed_range: cfeb367934ca01a6882217f4e3e3006f4c0a18f3..11438583e7e5d308200f1b9732d1c6b2499075fc

## Finding importante — troca de loteria durante busca de intervalo em andamento

**Local:** `src/App.jsx` (`handleFetchRange`, o `useEffect` de troca de `activeSlug`, as abas de loteria, o render do intervalo).

**Impacto:** `handleFetchRange` captura `active.slug` uma única vez e o callback de progresso faz `setIntervalResults((prev) => [...prev, item])` sem checar se a loteria ativa ainda é a mesma. `fetchDrawRange` (src/api.js:90-100) não tem `AbortController` nem token de cancelamento — roda o laço até o fim mesmo depois da troca. O `useEffect([activeSlug])` limpa `intervalResults` no momento da troca, mas o laço em voo continua chamando o callback depois e repopula a lista — agora renderizada com `lottery={active}` e `games={gamesForActive}` da loteria **nova**. Resultado: jogos de uma loteria aparecem conferidos contra o sorteio de outra, com rótulo/cor do ticket errados. Sem crash — resultado silenciosamente incorreto, o pior tipo de falha aqui. Viola a user story 26 da spec ("nunca ver os jogos de uma loteria conferidos contra o sorteio de outra"). Janela de reprodução é larga (até 25 fetches sequenciais, ordem de segundos) e as abas não ficam desabilitadas durante a busca, então é um clique normal.

**Mudança exigida:** uma busca de intervalo iniciada para uma loteria não pode mais escrever em `intervalResults`/`intervalProgress` depois que a loteria ativa mudou. Qualquer guarda serve (comparar o slug de origem no callback, um contador de geração, ou cancelar a busca na troca). Resultado exigido: trocar de loteria durante uma busca em andamento deixa a lista do intervalo vazia, sem nenhum ticket da loteria anterior aparecendo depois.

## Sugestão (não bloqueia)

`intervalProgress` não é zerado ao final de uma busca bem-sucedida (só no `catch`), e vira um discriminador implícito de modo pro texto de status. Não é bug hoje, mas é acoplamento latente. Considerar zerar `intervalProgress` no `finally` junto com `loading`, ou derivar o texto de status de um modo explícito.

## Checks (todos passaram)

- `npx vitest run`: 2 arquivos, 13 testes, todos passando.
- `npx oxlint`: exit 0, 1 warning pré-existente (`react(set-state-in-effect)`, já presente no base).
- `npx vite build`: sucesso, 23 módulos.
- `package-lock.json`: 22 entradas novas, todas `dev:true` — nenhuma dependência de produção.
- Árvore limpa após os checks.

## Critérios que passaram

Todos os demais critérios do ticket (validação de intervalo, busca em lote sequencial, forma estável do item, reuso do `DrawTicket`, indicador de progresso, exclusão mútua avulso/intervalo, testes de `intervalValidation` e `fetchDrawRange`, sem cache/persistência nova) — pass. Verificação manual no navegador: `not_verified` (ambiente do reviewer não tem browser/DOM; não é falha, é uma lacuna de evidência a fechar por quem for validar visualmente).

## Risco residual

Resiliência por concurso continua provisória por decisão do próprio ticket (uma falha derruba o lote inteiro) — correto, fica para o ticket 03.
