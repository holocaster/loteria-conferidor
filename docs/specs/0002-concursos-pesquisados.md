# Spec 0002 — Concursos salvos

Brief: `docs/briefs/0002-concursos-pesquisados.md`
Glossário e decisões cross-cutting: `docs/CONTEXT.md`

## Problem Statement

Quem confere jogo fixo repete busca o tempo todo. A pessoa busca o concurso
3090, fecha o app, volta no dia seguinte e busca o 3090 de novo para mostrar
para alguém da família. Busca um intervalo de dez concursos hoje, e amanhã
busca um intervalo que cobre oito dos mesmos concursos.

Hoje cada uma dessas buscas é uma ida nova à API da Caixa: a mesma espera, o
mesmo risco de a API estar fora do ar, o mesmo resultado. Um concurso já
sorteado não muda nunca mais — as dezenas, a data e o rateio de prêmio do
3090 são os mesmos para sempre — mas o app joga fora tudo que já buscou
assim que a tela é limpa.

O efeito é que a pessoa paga o custo de uma requisição por informação que já
esteve na mão dela, e perde acesso a um resultado que já viu sempre que a
API falha.

## Solution

Toda busca de concurso bem-sucedida passa a ficar salva no navegador,
automaticamente e sem nenhuma ação extra — do mesmo jeito que os jogos fixos
já ficam. Vale para o concurso avulso, para cada concurso de um intervalo e
para o "último sorteio" quando ele resolve a um concurso.

A partir daí, buscar de novo um concurso já salvo não chama mais a API: o
resultado aparece direto do que está salvo. Num intervalo, os concursos já
salvos aparecem na hora e só os que faltam são buscados. A única exceção é o
modo "último sorteio", que sempre vai à API — pode ter saído um sorteio novo
desde a última vez — e aproveita a resposta para atualizar o concurso salvo
correspondente.

Dentro do card "Conferir sorteio" que já existe, uma lista recolhível de
"concursos salvos" da loteria ativa mostra o que está guardado. Clicar num
item reabre aquele concurso no mesmo ticket que o resto do app usa,
conferido contra os jogos fixos *atuais* daquela loteria — se a pessoa
cadastrou um jogo novo depois de salvar o concurso, o jogo novo aparece
conferido ali. Cada item tem um botão para apagar, um de cada vez.

Concurso que deu erro nunca é salvo: não há resultado para guardar, e um
concurso ainda não sorteado (HTTP 500, ver `docs/CONTEXT.md`) não pode ficar
travado como "indisponível" para sempre.

## User Stories

1. Como pessoa com jogo fixo, quero que um concurso que busquei fique salvo automaticamente, para não precisar lembrar de clicar em "salvar".
2. Como pessoa com jogo fixo, quero que o concurso salvo guarde o resultado completo (dezenas, data, rateio de prêmio), para reabrir o mesmo ticket depois e não só o número do concurso.
3. Como jogador de Dupla-Sena, quero que o concurso salvo guarde os dois sorteios, para reabrir com o 1º e o 2º sorteio separados como na busca original.
4. Como pessoa com jogo fixo, quero que cada concurso de um intervalo buscado fique salvo, para aproveitar o lote inteiro depois e não só o último item.
5. Como pessoa com jogo fixo, quero que o "último sorteio" também fique salvo, para achá-lo pelo número na lista de salvos depois que ele deixar de ser o último.
6. Como pessoa com jogo fixo, quero que um concurso que falhou não seja salvo, para não ficar com um registro inútil que nunca vira resultado.
7. Como pessoa com jogo fixo, quero que um concurso ainda não sorteado que eu busquei por engano não fique salvo como erro, para conseguir buscá-lo de verdade depois que ele for sorteado.
8. Como pessoa com jogo fixo, quero que buscar de novo um concurso já salvo mostre o resultado sem chamar a API, para ter a resposta na hora.
9. Como pessoa com jogo fixo, quero que um concurso salvo continue acessível quando a API da Caixa estiver fora do ar, para não perder o acesso a um resultado que eu já tinha visto.
10. Como pessoa com jogo fixo, quero que um intervalo aproveite os concursos já salvos e só busque os que faltam, para uma busca repetida ser bem mais rápida que a primeira.
11. Como pessoa com jogo fixo, quero que a lista de um intervalo continue na ordem do concurso inicial ao final mesmo misturando concursos salvos e recém-buscados, para achar um concurso específico onde eu espero.
12. Como pessoa com jogo fixo, quero que o progresso do intervalo continue contando todos os concursos pedidos, para saber que a busca terminou mesmo quando quase tudo veio do que estava salvo.
13. Como pessoa com jogo fixo, quero que o "último sorteio" sempre vá à API, para nunca ver um resultado velho quando acabou de sair um sorteio novo.
14. Como pessoa com jogo fixo, quero que o "último sorteio" atualize o concurso salvo correspondente, para o que está guardado refletir a resposta mais recente da API.
15. Como pessoa com jogo fixo, quero ver uma lista dos concursos que já busquei na loteria ativa, para saber o que já tenho guardado sem tentar adivinhar.
16. Como pessoa com jogo fixo, quero que a lista de concursos salvos fique recolhida por padrão, para ela não empurrar o resultado da busca para baixo da tela.
17. Como pessoa com jogo fixo, quero que a lista mostre quantos concursos estão salvos, para decidir se vale abrir sem precisar abrir.
18. Como pessoa com jogo fixo, quero que a lista fique dentro do card "Conferir sorteio" que eu já uso, para não aprender uma tela nova nem perder a aba de jogos no celular.
19. Como pessoa com jogo fixo, quero que a lista mostre só os concursos da loteria ativa, para não misturar Mega-Sena com Quina, igual acontece com os jogos fixos.
20. Como pessoa com jogo fixo, quero que trocar de aba de loteria troque a lista de concursos salvos junto, para ver sempre o que é daquela loteria.
21. Como pessoa com jogo fixo, quero que cada item da lista mostre o número do concurso e a data, para identificar qual é qual.
22. Como pessoa com jogo fixo, quero os concursos salvos ordenados do mais recente para o mais antigo, para achar logo o que busquei por último.
23. Como pessoa com jogo fixo, quero clicar num concurso salvo e ver o ticket completo dele, para reconferir sem digitar o número de novo.
24. Como pessoa com jogo fixo, quero que o concurso salvo reaberto seja conferido contra os meus jogos de hoje, para um jogo cadastrado depois também aparecer conferido ali.
25. Como pessoa com jogo fixo, quero que o concurso reaberto use o mesmo ticket do resto do app, com acertos destacados e prêmio, para a leitura ser idêntica à de uma busca normal.
26. Como pessoa com jogo fixo, quero apagar um concurso salvo que não me interessa mais, para a lista não virar um depósito.
27. Como pessoa com jogo fixo, quero apagar um item por vez com um botão no próprio item, para não correr o risco de limpar tudo sem querer.
28. Como pessoa com jogo fixo, quero que apagar um concurso salvo não mexa nos outros nem nos meus jogos fixos, para não perder nada junto.
29. Como pessoa com jogo fixo, quero poder buscar de novo um concurso que eu apaguei, para o apagar ser reversível refazendo a busca.
30. Como pessoa com jogo fixo, quero salvar quantos concursos eu quiser, sem o app apagar os antigos sozinho, para confiar que o que eu vi ontem ainda está lá.
31. Como pessoa com jogo fixo, quero que os concursos salvos continuem lá quando eu fechar e reabrir o navegador, para o salvamento valer a pena.
32. Como pessoa com jogo fixo, quero que a lista de concursos salvos não apareça quando eu ainda não busquei nada naquela loteria, para não olhar para uma caixa vazia.
33. Como pessoa com jogo fixo, quero que tudo que o app já fazia continue igual — cadastrar e remover jogos, os três modos de busca, o erro inline de concurso indisponível — para não perder nada em troca.
34. Como usuária no celular, quero a lista de concursos salvos legível e clicável na tela pequena, sem uma terceira aba nova, para usar do jeito que já uso.

## Implementation Decisions

Continua tudo client-side: nenhum backend, nenhum banco, nenhum endpoint
novo na API da Caixa (ver `docs/CONTEXT.md`, decisão sobre a fonte de
resultados).

### Novo módulo: concursos salvos

Um módulo novo passa a ser o dono de duas coisas que andam juntas: a
persistência dos concursos salvos e a política de "saved-first" (usar o que
está salvo antes de chamar a API). É ele que `App` passa a chamar no lugar
de `fetchDraw`/`fetchDrawRange`.

Por que um módulo novo e não `storage.js` nem `api.js`:

- `storage.js` é o dono do `localStorage` dos **jogos fixos** — outro
  domínio, outro formato, outro ciclo de vida. Fica como está.
- `api.js` é o dono da **rede** (URL, normalização, formatos da Caixa). Seu
  comentário de cabeçalho já promete que trocar de fonte mexe só ali; fazê-lo
  ler `localStorage` quebraria isso e o tornaria intestável sem stub de
  browser.
- A decisão "usar o salvo ou ir à rede" não é nem uma nem outra: é a política
  que combina as duas, e é exatamente o que precisa de teste.

Interface do módulo (nomes em inglês, como o resto do código; termos de
domínio em pt-BR só na tela):

- `loadSavedDraws(slug)` — os concursos salvos daquela loteria, ordenados do
  maior número de concurso para o menor.
- `removeSavedDraw(slug, concurso)` — apaga um registro; não toca em nenhum
  outro nem nos jogos fixos.
- `getDraw(slug, concurso)` — se houver concurso salvo, devolve o salvo **sem
  nenhuma requisição**; senão busca com `fetchDraw`, salva e devolve. Erro de
  busca propaga como hoje e nada é salvo.
- `getLatestDraw(slug)` — **sempre** busca (`fetchDraw` sem concurso), salva
  ou sobrescreve o registro do concurso que voltou, e devolve.
- `getDrawRange(slug, concursos, onProgress)` — assume a orquestração do lote
  que hoje está em `fetchDrawRange`: percorre os concursos na ordem pedida e,
  para cada um, usa o salvo ou busca+salva. Mantém a forma de item já usada
  pela tela (`{ concurso, status: "ok", draw }` /
  `{ concurso, status: "erro", message }`), a ordem do intervalo e o callback
  de progresso uma vez por concurso — inclusive para os itens que vieram do
  salvo.

Com isso `fetchDrawRange` sai de `api.js` (junto com a mensagem de erro por
item, que é da política do lote e não da rede) e `api.js` fica só com
`fetchDraw` + normalização, sem mudança de comportamento em nenhuma das
duas. Os testes de lote acompanham a mudança de módulo.

### Formato do concurso salvo

- Chave própria no `localStorage`, irmã da dos jogos fixos
  (`conferidor:jogos` → `conferidor:concursos`). Nada de reaproveitar a mesma
  chave nem o mesmo array: apagar concurso salvo nunca pode arriscar um jogo
  fixo.
- Um registro é `{ slug, concurso, draw }`, onde `concurso` é numérico e é a
  chave junto com `slug`. Identidade é (loteria, concurso): salvar um
  concurso já salvo sobrescreve, não duplica.
- **O número do concurso digitado vem como string do input e o normalizado da
  API vem como número.** A busca do salvo compara sempre coerção numérica dos
  dois lados; isso é comportamento testado, não detalhe.
- `draw` guarda os campos normalizados que o ticket usa (concurso, data,
  dezenas, dezenas do 2º sorteio, acumulou, valores do próximo concurso,
  rateio de prêmio). O campo `raw` **não** é guardado: ele existe como apoio
  de depuração de uma resposta inesperada, e duplicaria cada registro no
  `localStorage` sem nenhum consumidor.
- Leitura defensiva igual à dos jogos fixos: JSON corrompido ou ausente vira
  lista vazia, nunca exceção.
- Escrita é best-effort: se o `localStorage` recusar a gravação (cota cheia),
  o resultado da busca continua sendo mostrado normalmente e a falha não
  vira erro de tela. Não há eviction nem limite de quantidade (decisão em
  `docs/CONTEXT.md`).

### Lista de concursos salvos na tela

- Um bloco recolhível dentro do card "Conferir sorteio", abaixo dos
  controles de busca, com título mostrando a contagem (ex: "Concursos salvos
  (7)"). Recolhido por padrão.
- Quando a loteria ativa não tem nenhum concurso salvo, o bloco **não
  aparece** — sem caixa vazia.
- Escopado pela loteria ativa, igual à lista de jogos fixos. Trocar de aba de
  loteria troca o conteúdo do bloco.
- Sem nova aba no seletor mobile ("Conferir" / "Meus jogos") e sem mudança no
  layout de duas colunas do desktop. Brief: a lista mora dentro do card que
  já existe.
- Cada item mostra o número do concurso e a data, e tem um botão de apagar
  no próprio item, no espírito do botão "remover" dos jogos fixos — sem
  confirmação, igual ao que já existe hoje para jogo fixo.
- Ordem: concurso maior primeiro (mais recente no topo).
- Clicar no item abre aquele concurso no resultado avulso da tela, pelo mesmo
  componente de ticket usado no resto do app, conferido contra os jogos
  fixos atuais da loteria ativa — não uma foto do momento em que foi salvo,
  que é consequência direta de o ticket receber os jogos por prop.
- Abrir um concurso salvo obedece à exclusividade mútua que já existe entre
  resultado avulso e lista de intervalo: abrir um salvo limpa a lista do
  intervalo, e uma busca nova limpa o resultado do salvo.
- Apagar um concurso salvo que está aberto na tela **não** fecha o ticket
  aberto: a lista e o que está sendo exibido são coisas separadas, e fechar
  seria uma surpresa. O concurso simplesmente sai da lista.
- O estado da lista em `App` acompanha as escritas: salvar durante uma busca
  e apagar pela lista atualizam o que está na tela sem recarregar a página.

## Testing Decisions

Um bom teste aqui exercita comportamento externo: "buscar duas vezes o mesmo
concurso dispara uma requisição só", "concurso que falhou não aparece na
lista de salvos". Nunca a implementação: nada de verificar a chave do
`localStorage` por dentro, a ordem de chamadas internas ou o formato JSON
serializado.

**Nenhuma seam nova.** As duas que o repositório já tem cobrem esta feature
inteira, e as duas já têm arte prévia exata para o que ela precisa:

1. **Vitest em ambiente node, no nível do módulo** — `storage.test.js` já
   stuba `localStorage` global em memória com `vi.stubGlobal`; `api.test.js`
   já stuba o `fetch` global. O módulo de concursos salvos precisa
   exatamente desses dois stubs juntos, e é onde mora a lógica de risco.
2. **Playwright e2e com `page.route`** — `e2e/busca.spec.js` já intercepta
   `**/portaldeloterias/api/...` e já tem o padrão de provar que **nenhuma**
   requisição foi feita (a flag `requested` do teste de intervalo inválido).
   Contar requisições é a única forma honesta de provar "não chamou a API", e
   é no browser de verdade que o `localStorage` é real.

Módulo testado no vitest (concursos salvos):

- busca bem-sucedida salva o resultado; buscar o mesmo concurso de novo não
  chama `fetch`;
- busca que falha (HTTP 500) propaga o erro e não salva nada;
- concurso pedido como string acha o concurso salvo gravado com número;
- salvar um concurso já salvo sobrescreve em vez de duplicar;
- "último sorteio" chama `fetch` mesmo com o concurso já salvo, e o registro
  salvo passa a refletir a resposta nova;
- registros são escopados por loteria: mesmo número de concurso em duas
  loterias são dois registros, e o salvo de uma loteria nunca é servido para
  outra;
- lote com parte dos concursos já salvos: um `fetch` só para os que faltam,
  itens na ordem do intervalo, um item por concurso pedido, progresso
  chamado uma vez por concurso;
- lote com um concurso que falha: item de erro na posição dele, os demais
  seguem, e o que falhou não é salvo (regressão da decisão do 0001);
- apagar remove só o registro pedido e não afeta os jogos fixos;
- JSON corrompido na chave devolve lista vazia em vez de estourar;
- gravação que falha (stub de `setItem` que lança) não impede a busca de
  devolver o resultado.

Fluxos testados no e2e:

- buscar o mesmo concurso duas vezes dispara uma requisição só e mostra o
  mesmo ticket nas duas;
- o concurso buscado aparece na lista de concursos salvos da loteria ativa;
- clicar num concurso salvo reabre o ticket, conferido contra um jogo
  cadastrado **depois** de o concurso ter sido salvo;
- apagar um item remove só ele da lista;
- concurso que respondeu 500 não aparece na lista de salvos;
- "último sorteio" dispara requisição mesmo com o concurso salvo.

Todo ticket também precisa passar `npm run lint`, `npm run build`,
`npm test` e `npm run test:e2e`.

## Out of Scope

- Apagar em lote, apagar tudo, ou tratar um intervalo salvo como uma unidade
  apagável — só item individual.
- Editar um concurso salvo. As únicas escritas são inserir (automático),
  sobrescrever pelo "último sorteio" e apagar.
- Atualizar sozinho um concurso já salvo (dados imutáveis até apagar e
  buscar de novo), fora da exceção do "último sorteio".
- Qualquer limite de quantidade, eviction, expiração por tempo ou aviso de
  cota do `localStorage`.
- Sincronizar entre dispositivos, navegadores ou perfis; exportar/importar os
  concursos salvos. Mesma limitação que já vale para jogo fixo.
- Indicar na tela que um resultado veio do salvo em vez da API — o ticket é o
  mesmo e não ganha selo, rótulo nem data de quando foi salvo.
- Buscar, filtrar ou paginar a lista de concursos salvos.
- Guardar os jogos fixos do momento da busca junto do concurso salvo — a
  conferência é sempre contra os jogos atuais.
- Mudar `fetchDraw`, a normalização da resposta, o teto de 25 do intervalo ou
  o `localStorage` dos jogos fixos.
- Nova aba mobile, nova rota, ou mudança no layout de duas colunas.
- Qualquer backend, proxy, service worker ou cache de HTTP.

## Further Notes

- "Concurso salvo" é o termo do glossário (`docs/CONTEXT.md`) e deve aparecer
  assim na tela mesmo que a implementação seja, tecnicamente, um cache.
  "Histórico" e "cache" não vão para a interface.
- A premissa que justifica servir o salvo sem revalidar é que concurso
  sorteado é imutável: dezenas, data e rateio de um concurso passado não
  mudam. O "último sorteio" é a única busca cujo alvo pode ter mudado desde
  a última vez, e por isso é a única exceção.
- HTTP 500 na API da Caixa cobre "ainda não sorteado" e erro real do servidor
  sem distinguir os dois (`docs/CONTEXT.md`). É por isso que erro nunca é
  salvo: salvar um 500 congelaria como indisponível um concurso que amanhã
  existe.
- Nenhum ADR novo: as quatro decisões estruturais desta feature (salvar
  automaticamente, saved-first com exceção do último sorteio, apagar por
  item, sem limite) já estão registradas em `docs/CONTEXT.md`.
