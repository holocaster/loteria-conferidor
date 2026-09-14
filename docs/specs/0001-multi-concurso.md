# Spec 0001 — Buscar intervalo de concursos

Brief: `docs/briefs/0001-multi-concurso.md`
Glossário e decisões cross-cutting: `docs/CONTEXT.md`

## Problem Statement

Quem tem jogo fixo quase nunca confere um concurso só. A pessoa passa duas
semanas sem olhar o app e quer saber se algum dos jogos dela bateu em
qualquer concurso desse período.

Hoje o app só sabe conferir um concurso por vez: ou o último sorteio, ou um
número de concurso digitado à mão. Para cobrir nove concursos a pessoa
precisa digitar nove números, um de cada vez, esperar cada busca e comparar
os resultados de cabeça, porque cada busca apaga a anterior da tela. É
repetitivo, é fácil pular um concurso sem perceber, e o esforço cresce
exatamente quando a pessoa ficou mais tempo sem conferir.

## Solution

Um terceiro modo de busca na seção "Conferir sorteio", ao lado de "Buscar
concurso" e "Usar o último sorteio": dois campos numéricos, "de" e "até".

A pessoa informa o intervalo (ex: do 3090 ao 3098) e recebe uma lista de
tickets empilhados, um por concurso, do início ao fim do intervalo. Cada
ticket é exatamente o ticket que o app já mostra hoje: as dezenas sorteadas
daquele concurso (os dois sorteios, no caso da Dupla-Sena) e a conferência
de todos os jogos fixos salvos da loteria ativa, com os acertos destacados.

Duas regras protegem a pessoa de pedidos que não fazem sentido, e ambas são
verificadas **antes de qualquer requisição**: o concurso final não pode ser
menor que o inicial, e o intervalo não pode passar de 25 concursos. Um
intervalo inválido é recusado com uma mensagem de erro e nenhuma busca é
feita — o app nunca corrige silenciosamente nem inverte os valores.

Se um concurso do intervalo não puder ser buscado (tipicamente um concurso
que ainda não foi sorteado, que a API da Caixa devolve como HTTP 500), esse
concurso aparece como uma linha de erro no lugar do ticket dele e os demais
concursos do intervalo continuam sendo buscados e mostrados normalmente.

## User Stories

1. Como pessoa com jogo fixo, quero informar um concurso inicial e um final, para conferir meus jogos contra vários concursos de uma vez.
2. Como pessoa com jogo fixo, quero ver os campos "de" e "até" na mesma seção "Conferir sorteio" que já uso, para não precisar aprender uma tela nova.
3. Como pessoa com jogo fixo, quero que o modo de intervalo conviva com os dois modos que já existem, para continuar conferindo um concurso avulso ou o último sorteio quando é só isso que eu quero.
4. Como pessoa com jogo fixo, quero um resultado por concurso empilhado numa lista, para percorrer o período inteiro rolando a tela em vez de refazendo buscas.
5. Como pessoa com jogo fixo, quero que os resultados apareçam na ordem do concurso inicial para o final, para conseguir localizar um concurso específico na lista.
6. Como pessoa com jogo fixo, quero que cada item da lista mostre as dezenas sorteadas daquele concurso, para conferir visualmente além dos acertos contados.
7. Como pessoa com jogo fixo, quero que cada item da lista mostre todos os meus jogos salvos da loteria ativa conferidos, para não precisar escolher jogo por jogo.
8. Como pessoa com jogo fixo, quero que os números que bateram apareçam destacados em cada item, igual à conferência de um concurso só, para bater o olho e entender o resultado.
9. Como jogador de Dupla-Sena, quero que cada item do intervalo mostre o 1º e o 2º sorteio separadamente com a contagem de acertos de cada um, para não confundir os dois sorteios do mesmo concurso.
10. Como pessoa com jogo fixo, quero que os itens premiados do intervalo fiquem destacados do mesmo jeito que hoje, para achar rápido o concurso em que ganhei alguma coisa.
11. Como pessoa com jogo fixo, quero informar o mesmo número em "de" e "até", para usar o modo de intervalo mesmo quando quero um concurso só.
12. Como pessoa com jogo fixo, quero ser avisada quando o concurso final for menor que o inicial, para corrigir o que eu digitei em vez de receber um resultado estranho.
13. Como pessoa com jogo fixo, quero que um intervalo invertido não dispare nenhuma busca, para não gastar tempo esperando algo que já nasceu errado.
14. Como pessoa com jogo fixo, quero que o app nunca troque "de" e "até" de lugar sozinho, para confiar que o que eu pedi foi o que foi buscado.
15. Como pessoa com jogo fixo, quero ser avisada quando eu pedir mais de 25 concursos, para reduzir o intervalo em vez de ficar olhando uma tela gigante.
16. Como pessoa com jogo fixo, quero que o intervalo grande demais seja recusado antes de qualquer requisição, para o app não disparar uma rajada enorme de buscas por engano.
17. Como pessoa com jogo fixo, quero que a mensagem de erro diga qual é o limite e quanto eu pedi, para saber exatamente quanto preciso cortar.
18. Como pessoa com jogo fixo, quero que o botão de buscar intervalo fique indisponível enquanto eu não preencher os dois campos, para não disparar uma busca pela metade.
19. Como pessoa com jogo fixo, quero ver que a busca está em andamento e o quanto já andou, para saber que o app não travou quando peço muitos concursos.
20. Como pessoa com jogo fixo, quero ver os tickets aparecerem conforme são buscados, para começar a conferir os primeiros concursos sem esperar o intervalo inteiro.
21. Como pessoa com jogo fixo, quero que um concurso que ainda não foi sorteado apareça como uma linha de erro no lugar do ticket dele, para entender que aquele concurso não existe ainda em vez de achar que sumiu.
22. Como pessoa com jogo fixo, quero que a falha de um concurso não cancele os outros do intervalo, para não perder toda a busca por causa de um concurso indisponível.
23. Como pessoa com jogo fixo, quero que a linha de erro diga de qual concurso ela é, para saber exatamente qual faltou.
24. Como pessoa com jogo fixo, quero fazer uma nova busca de intervalo por cima da anterior, para comparar períodos sem recarregar a página.
25. Como pessoa com jogo fixo, quero que buscar um concurso avulso limpe a lista de intervalo anterior, para não ficar em dúvida sobre qual resultado é de qual busca.
26. Como pessoa com jogo fixo, quero que trocar de loteria limpe o resultado do intervalo, para nunca ver os jogos de uma loteria conferidos contra o sorteio de outra.
27. Como pessoa com jogo fixo, quero que o modo de intervalo funcione nas sete loterias suportadas, para não ter uma loteria de segunda classe no app.
28. Como pessoa sem nenhum jogo cadastrado na loteria ativa, quero ver as dezenas sorteadas de cada concurso do intervalo mesmo assim, para usar o app como consulta de resultados.
29. Como pessoa com jogo fixo, quero continuar podendo cadastrar e remover jogos normalmente enquanto uso o modo de intervalo, para não perder nada do que o app já fazia.
30. Como usuária no celular, quero a lista do intervalo legível na tela pequena, para conferir do jeito que eu já uso o app.

## Implementation Decisions

O app continua 100% client-side: um fetch por concurso direto do navegador
para a API da Caixa, sem backend, sem proxy e sem endpoint em lote (ver
`docs/CONTEXT.md`, decisão sobre a fonte de resultados).

### Novo módulo: validação de intervalo

Módulo pequeno e puro (sem `fetch`, sem React), responsável por transformar
o que foi digitado nos campos "de"/"até" em uma lista de concursos a buscar,
ou em uma recusa.

- Entrada: os dois valores crus dos campos. Saída: ou `{ ok: true, concursos: [...] }`
  com a lista de números do início ao fim, inclusive nas duas pontas; ou
  `{ ok: false, message }` com a mensagem em pt-BR pronta para a tela.
- Ordem das recusas: valores não preenchidos / não inteiros / menores que 1
  primeiro; depois final menor que inicial; depois tamanho maior que 25.
- O teto de 25 é uma constante exportada por esse módulo, para a mensagem de
  erro e um eventual texto de ajuda não divergirem do número real.
- Tamanho do intervalo é `até - de + 1` (3090 a 3114 são 25 concursos —
  válido; 3090 a 3115 são 26 — recusado). `de` igual a `até` é um intervalo
  válido de um concurso.
- A função nunca inverte nem corta valores: intervalo inválido só produz
  recusa.

### API: busca em lote

Ao lado da busca de um concurso (`fetchDraw`), o módulo de API ganha uma
busca de vários concursos que **não propaga a falha de um item**.

- Recebe a loteria, a lista de concursos já validada, e um callback chamado
  a cada concurso resolvido.
- Busca **sequencialmente**, um concurso por vez, reutilizando `fetchDraw` —
  mesma URL, mesma normalização, mesmo tratamento de Dupla-Sena. Nenhuma
  mudança em `fetchDraw` nem na normalização.
- Cada concurso vira um item de resultado com forma estável:
  `{ concurso, status: "ok", draw }` ou `{ concurso, status: "erro", message }`.
- A mensagem de erro de um item é gerada aqui, em pt-BR, no espírito da
  decisão de `CONTEXT.md` de que HTTP 500 significa "não disponível" e não
  falha de infraestrutura. A mensagem de `fetchDraw` (usada no modo de um
  concurso só) não muda.
- A ordem dos itens é sempre a ordem do intervalo, do menor para o maior,
  independentemente de quais falharam.
- Sequencial (e não em paralelo) por dois motivos: mantém a rajada pequena,
  coerente com o teto de 25 ser de produto e não técnico; e permite renderizar
  os tickets conforme chegam.

### Componente de ticket reutilizável

O bloco que hoje desenha o resultado de um concurso dentro de `App` —
cabeçalho, dezenas, 2º sorteio da Dupla-Sena, aviso de acumulado e a
conferência dos jogos salvos — é extraído para um componente próprio, que
recebe a loteria ativa, um resultado de concurso e os jogos salvos daquela
loteria.

- O modo de um concurso passa a renderizar através desse componente, sem
  nenhuma mudança visual. É essa extração que torna possível empilhar N
  tickets sem duplicar o layout.
- O helper de formatação de dinheiro acompanha o componente.
- O layout do ticket é reusado **como está** no modo intervalo, incluindo o
  aviso de acumulado e o título "Seus jogos nesse concurso" repetido por
  item. Brief: "reaproveitando o layout de ticket já existente".
- A contagem de acertos continua sendo feita por `countHits`, com o
  tratamento existente de Dupla-Sena (um jogo pode bater no 1º sorteio, no
  2º, nos dois ou em nenhum) e o destaque de premiado por `prizeFrom`.

### Estado e interação na tela

- A seção "Conferir sorteio" ganha uma segunda linha de controles: campo "de",
  campo "até" e o botão do terceiro modo. Os dois modos existentes ficam
  intactos, na linha que já existe.
- Os dois campos são numéricos, independentes. Sem campo de texto único do
  tipo "3090-3098" (decisão fechada na descoberta).
- O botão do intervalo fica desabilitado enquanto os dois campos não
  estiverem preenchidos ou enquanto houver busca em andamento — mesmo
  critério que já existe para "Buscar concurso".
- Erro de validação usa o mesmo lugar e estilo de erro que já existe na
  seção, e não dispara nenhuma requisição.
- O resultado do intervalo e o resultado de um concurso só são mutuamente
  exclusivos na tela: iniciar uma busca de intervalo limpa o resultado
  avulso, e iniciar uma busca avulsa (ou "último sorteio") limpa a lista do
  intervalo. Trocar de loteria limpa os dois, junto com o que o
  `useEffect` de troca de loteria já limpa hoje.
- Durante a busca, um indicador mostra o progresso em concursos (quantos de
  quantos) e os itens já resolvidos vão sendo renderizados.
- Um item com `status: "erro"` é renderizado como uma linha de erro inline no
  lugar do ticket, identificando o concurso. Um item com `status: "ok"`
  renderiza o componente de ticket.
- Sem cache entre buscas: cada busca de intervalo refaz todos os fetches.
- Sem persistência do último intervalo digitado.

## Testing Decisions

Hoje o repositório não tem nenhum teste nem runner configurado — só `oxlint`.
Não existe, portanto, seam de teste prévia para reaproveitar, e a arte
anterior é apenas o lint mais a verificação manual no navegador.

**Decisão: adotar `vitest` como única seam nova, no nível mais alto
possível, e limitada à lógica pura + à busca em lote.** Sem jsdom, sem
testing-library, sem teste de componente React. Motivo: o risco real desta
feature está em duas regras que o clique manual não pega com confiança — o
off-by-one do tamanho do intervalo (`até - de + 1`) e o isolamento da falha
de um concurso — e ambas são alcançáveis por uma seam de módulo, em ambiente
node, sem nenhuma infraestrutura de DOM. É uma dependência de
desenvolvimento, sem impacto no bundle nem no comportamento do app.

O que faz um bom teste aqui: exercitar o comportamento externo do módulo
(entrada digitada → lista de concursos ou recusa; lista de concursos →
itens de resultado ordenados), nunca a implementação interna. Nada de
verificar quantas vezes uma função privada foi chamada ou a ordem de
chamadas internas.

Módulos testados:

- **Validação de intervalo** (puro, sem I/O): intervalo válido produz a lista
  inclusiva nas duas pontas; `de == até` produz um concurso; exatamente 25
  concursos passa; 26 é recusado; final menor que inicial é recusado; campos
  vazios / não numéricos / menores que 1 são recusados; nenhuma recusa
  inverte ou corta valores.
- **Busca em lote**: com `fetch` global substituído por um duplo de teste —
  todos os concursos OK produzem itens `ok` na ordem do intervalo; um
  concurso que responde HTTP 500 no meio produz um item `erro` naquela
  posição e os demais continuam `ok`; o callback de progresso é chamado uma
  vez por concurso; a lista final tem um item por concurso pedido.

Fora da seam automatizada, verificado manualmente no navegador (checklist nos
tickets): aparência dos tickets empilhados, o caso Dupla-Sena com dois
sorteios por concurso, a linha de erro inline, a limpeza de resultado ao
trocar de modo e ao trocar de loteria, e o comportamento no celular.

Todo ticket também precisa passar `npm run lint` e `npm run build`.

## Out of Scope

- Cache entre buscas — cada busca de intervalo refaz todos os fetches, sem
  guardar concursos já vistos.
- Escolher quais jogos conferir — continua conferindo todos os jogos salvos
  da loteria ativa.
- Persistir o último intervalo digitado.
- Visão agregada ou resumo do intervalo (ex: "melhor resultado no período").
  Só a lista concurso a concurso.
- Qualquer mudança de backend, proxy ou endpoint em lote na API.
- Mudar o teto de 25 ou torná-lo configurável pela pessoa.
- Buscar intervalos de mais de uma loteria ao mesmo tempo.
- Testes de componente React / DOM, e qualquer infraestrutura de teste além
  do runner em ambiente node.
- Mudanças no cadastro de jogos, no `localStorage` ou na normalização de
  resposta da API.

## Further Notes

- O teto de 25 é decisão de produto, não limite técnico: a API da Caixa não
  demonstrou rate limit em rajadas pequenas ou moderadas de requisições
  sequenciais, testado diretamente (ver `docs/CONTEXT.md`).
- HTTP 500 na API da Caixa cobre tanto "concurso não existe / ainda não
  sorteado" quanto erro real do servidor — a API não distingue os dois. Por
  isso a linha de erro inline fala em "não disponível" e não afirma que o
  concurso não existe.
- Nenhum ADR foi aberto para esta feature: as duas decisões estruturais
  (fonte da API e semântica do HTTP 500) já estão registradas em
  `docs/CONTEXT.md` e no comentário de cabeçalho do módulo de API.
