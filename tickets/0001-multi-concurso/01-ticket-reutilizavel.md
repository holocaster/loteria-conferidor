# 01: Extrair o ticket de concurso para um componente reutilizável

**What to build:** nada muda para quem usa o app. O resultado de "Buscar
concurso" e de "Usar o último sorteio" continua exatamente igual — mesmo
cabeçalho, mesmas dezenas, mesmo 2º sorteio da Dupla-Sena, mesmo aviso de
acumulado, mesma conferência dos jogos salvos com acertos destacados e
premiado realçado.

O que muda é por baixo: o bloco que desenha esse ticket sai de dentro de
`App` e vira um componente próprio, que recebe a loteria ativa, um resultado
de concurso e os jogos salvos daquela loteria. É essa extração que permite,
nos tickets seguintes, empilhar um ticket por concurso sem duplicar layout.

**Blocked by:** None (can start immediately).

**Spec:** `docs/specs/0001-multi-concurso.md` — "Implementation Decisions ›
Componente de ticket reutilizável". **ADRs:** nenhum; ver `docs/CONTEXT.md`
(Dupla-Sena, Acerto).

- [ ] Existe um componente de ticket de concurso em seu próprio arquivo em
      `src/`, recebendo a loteria ativa, o resultado do concurso e os jogos
      salvos da loteria, e `App` renderiza o resultado avulso através dele.
- [ ] O componente não lê estado global nem `localStorage`: tudo entra por
      props, para poder ser renderizado N vezes com concursos diferentes.
- [ ] O helper de formatação de dinheiro acompanha o componente e não fica
      órfão em `App`.
- [ ] Nenhuma mudança em `fetchDraw`, na normalização da resposta, em
      `countHits`, no cadastro de jogos ou no `localStorage`.
- [ ] Nenhuma mudança de classe CSS ou de marcação que altere a aparência: o
      DOM renderizado do ticket é equivalente ao de antes.
- [ ] Verificado manualmente no navegador: Mega-Sena com "Usar o último
      sorteio" e Dupla-Sena com um concurso digitado (dois sorteios, 1º e 2º,
      cada um com sua contagem de acertos) continuam idênticos ao
      comportamento anterior.
- [ ] Verificado manualmente: loteria sem nenhum jogo cadastrado mostra as
      dezenas sorteadas e omite a lista de conferência, como antes.
- [ ] `npm run lint` e `npm run build` passam.
