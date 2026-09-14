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

## ✅ Risco #1 — RESOLVIDO (verificado contra a API real em 2026-09-14)

Estava desatualizado: a branch `0001-multi-concurso` já trocou a fonte pra
`https://servicebus2.caixa.gov.br/portaldeloterias/api/<loteria>[/<concurso>]`
(API interna da Caixa — CORS liberado, `api.guidi.dev.br` foi descartada por
bloquear CORS em teste real). `src/api.js` (comentário no topo do arquivo)
já documenta essa decisão.

Testado ao vivo nesta sessão com `curl` contra endpoints reais:
- Mega-Sena e Lotofácil: `normalize()` bate campo a campo (`listaDezenas`,
  `numero`, `dataApuracao`, `acumulado`, `localSorteio`,
  `valorEstimadoProximoConcurso`, `dataProximoConcurso`).
- Dupla-Sena: `listaDezenasSegundoSorteio` confere, e o 2º sorteio é
  comparado separadamente em `DrawTicket.jsx`.
- Concurso inválido/não sorteado (`megasena/99999`): API retorna HTTP 500
  de fato — `fetchDraw` já trata isso via `!res.ok`.

Nenhuma mudança de código foi necessária. Não reabrir sem motivo novo.

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

1. Trocar `SEU-DOMINIO-AQUI.com` pelo domínio real em `index.html`,
   `robots.txt` e `sitemap.xml` — só depois do deploy, quando o domínio
   existir.
2. Deploy em Vercel ou Netlify (comandos no README).
3. Opcional: Super Sete e +Milionária, se fizerem falta.
4. Opcional: mensagens de erro mais específicas quando a API não responde
   (hoje é só uma string genérica).

## Onde não mexer sem necessidade

- `countHits()` em `lotteries.js` assume que "acerto" é número por número —
  válido pras 7 loterias implementadas, mas não serve pra Super Sete se for
  adicionada (lá o acerto é por posição/coluna, não por conjunto).
