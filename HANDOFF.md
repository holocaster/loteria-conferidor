# Handoff — Conferidor de Loteria

Contexto pra quem (ou qual IA) for continuar este projeto.

## O que é

App React (Vite, JS puro) que deixa cadastrar jogos fixos de loteria e
conferir automaticamente contra resultados oficiais. Caso de uso real: uma
pessoa confere os jogos fixos do pai dela sem precisar checar manualmente.

## Status atual

Funcional localmente (`npm install && npm run dev`), build de produção
passa sem erros (`npm run build`). **Nunca foi testado contra a API real em
produção** — ver "Risco #1" abaixo, é o primeiro coisa a verificar.

## Stack e decisões

| Decisão | Por quê |
|---|---|
| React + Vite, sem framework SSR | Pedido explícito do usuário nesta conversa |
| `localStorage` pros jogos salvos | Sem backend/conta de usuário — jogos ficam só no navegador de quem usa |
| Fetch client-side direto na API | Simplicidade; sem servidor próprio pra manter |
| CSS puro (sem Tailwind/lib) | Projeto pequeno, não justificava dependência extra |

## Estrutura

```
src/
  lotteries.js    regras de cada loteria (qtd números, faixa, prêmio mínimo)
  api.js          busca + normaliza resultado da API de sorteios
  storage.js      helpers de localStorage pros jogos salvos
  NumberPicker.jsx grade de botões pra escolher números
  App.jsx         tela principal (abas, busca, cadastro, comparação)
public/
  robots.txt, sitemap.xml, llms.txt   SEO + GEO (ver seção própria no README)
```

## ⚠️ Risco #1 — formato da resposta da API não foi confirmado

`src/api.js` chama `https://api.guidi.dev.br/loteria/<loteria>/<concurso|ultimo>`.
Essa API é de terceiros (não é da Caixa), está ativa (README do projeto
mostra uso em jun/2026), mas **eu não consegui de fato chamar o endpoint**
durante o desenvolvimento — o ambiente onde montei isso só tinha acesso de
rede a domínios de pacotes (npm, pip, etc.), não a APIs arbitrárias da web.
Ou seja: o parsing em `normalize()` foi escrito com base no formato usado
por APIs irmãs/similares (mesma origem de projeto), não confirmado contra
o JSON real dessa API específica.

**Primeiro passo ao continuar**: rodar o app, abrir o DevTools → Network,
chamar `handleFetch`, e comparar o JSON retornado com as chaves que
`normalize()` em `src/api.js` procura (`dezenas`, `concurso`, `data`,
`acumulou`, etc.). Ajustar a lista de chaves em `pick(...)` se os nomes
reais forem diferentes.

Se a API estiver instável ou bloqueando CORS de chamada direta do
navegador, alternativas testadas por outros projetos (documentadas no
README):
- `https://servicebus2.caixa.gov.br/portaldeloterias/api/<loteria>` — API
  interna da própria Caixa, mas não é pensada pra consumo externo, então
  pode não ter CORS liberado para chamada direta do browser. Se travar por
  CORS, provavelmente vai precisar de uma function serverless simples
  (Vercel/Netlify) como proxy.
- Forks tipo `loteriascaixa-api` — vários estão hospedados no Heroku free
  tier, que foi descontinuado, então o endereço pode estar morto. Checar
  antes de depender.

## Risco #2 — só 7 loterias implementadas

`lotteries.js` cobre Mega-Sena, Lotofácil, Quina, Lotomania, Dupla-Sena,
Timemania e Dia de Sorte — todas com a mesma mecânica (escolher N números,
contar acertos). **Não implementadas**: Super Sete (mecânica por coluna,
não por número) e +Milionária (números + trevos). Se forem pedidas, vão
precisar de lógica de comparação diferente, não só uma entrada no config.

## Risco #3 — crawlers de IA não veem os resultados dinâmicos

SPA em React client-side. Google indexa JS razoavelmente bem; a maioria dos
crawlers de IA (GPTBot, ClaudeBot etc.) não executa JS e só vê o HTML
estático (`<noscript>`, meta tags, `llms.txt`). Isso foi uma escolha
consciente pra manter o projeto simples — documentado no README. Se algum
dia isso importar de verdade, o caminho é migrar pra algo com SSR/SSG
(Next.js, Astro).

## Pendências / próximos passos sugeridos

1. Validar `normalize()` contra a resposta real da API (Risco #1).
2. Trocar `SEU-DOMINIO-AQUI.com` pelo domínio real em `index.html`,
   `robots.txt` e `sitemap.xml` — só depois do deploy, quando o domínio
   existir.
3. Deploy em Vercel ou Netlify (comandos no README).
4. Opcional: Super Sete e +Milionária, se fizerem falta.
5. Opcional: mensagens de erro mais específicas quando a API não responde
   (hoje é só uma string genérica).

## Onde não mexer sem necessidade

- `countHits()` em `lotteries.js` assume que "acerto" é número por número —
  válido pras 7 loterias implementadas, mas não serve pra Super Sete se for
  adicionada (lá o acerto é por posição/coluna, não por conjunto).
