# Conferidor de Loteria

App client-side (sem backend) para cadastrar jogos fixos de loteria e conferi-los contra resultados oficiais.

## Language

**Concurso**:
Edição numerada de um sorteio de uma loteria (ex: concurso 3057 da Mega-Sena). Cada loteria tem sua própria sequência de concursos.
_Avoid_: Sorteio (usar só quando o concurso tem mais de um sorteio, ver Dupla-Sena), edição, rodada.

**Dezena**:
Um dos números sorteados em um concurso.
_Avoid_: número sorteado, bola.

**Jogo fixo**:
Conjunto de números que a pessoa cadastra e quer conferir repetidamente contra concursos futuros/passados. Salvo só no `localStorage` do navegador.
_Avoid_: aposta, bilhete, cartela.

**Dupla-Sena**:
Única loteria com dois sorteios (1º e 2º) dentro do mesmo concurso — cada um com seu próprio conjunto de dezenas e sua própria faixa de premiação. Um jogo pode bater em um sorteio, no outro, nos dois ou em nenhum.
_Avoid_: tratar como um sorteio único com o dobro de dezenas.

**Acerto**:
Quantidade de dezenas do jogo fixo que coincidem com as dezenas sorteadas em um concurso (ou em um dos sorteios da Dupla-Sena).

## Decisions

**Concurso inexistente ou ainda não sorteado é um erro do servidor (HTTP 500), não 404.**
A API da Caixa não distingui "não existe" de "erro interno" — ambos vêm como 500. Qualquer fluxo que busque um concurso específico (avulso ou em lote) precisa tratar 500 como "não disponível", não como falha de infraestrutura.

**Busca em lote (intervalo de concursos) é limitada a 25 por vez.**
Decisão de produto, não limite técnico — a API não demonstrou rate limit em testes com rajadas pequenas/moderadas. O teto existe para manter a lista de resultados navegável e evitar buscas acidentalmente enormes. Um intervalo inválido (fim antes do início, ou maior que 25) é rejeitado antes de qualquer requisição.

**Uma falha em um concurso do intervalo não aborta o restante.**
Cada concurso do lote é buscado e reportado independentemente; um que falhar aparece como erro inline no lugar do seu resultado, os demais seguem normalmente.
