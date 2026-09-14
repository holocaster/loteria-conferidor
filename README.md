# Conferidor de Loteria

App em React (Vite) para cadastrar jogos fixos de loteria e conferir
automaticamente contra os resultados oficiais — Mega-Sena, Lotofácil, Quina,
Lotomania, Dupla-Sena, Timemania e Dia de Sorte.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como funciona

- **`src/lotteries.js`** — regras de cada loteria (quantos números, faixa de
  valores, a partir de quantos acertos já premia).
- **`src/api.js`** — busca o resultado na API pública
  [`api.guidi.dev.br`](https://github.com/guidi/loteria_api) e normaliza a
  resposta.
- **`src/storage.js`** — salva os jogos fixos no `localStorage` do
  navegador. Não há backend nem banco de dados neste projeto.
- **`src/App.jsx`** — a interface: abas por loteria, busca de concurso,
  comparação e cadastro de jogos.

### Se a API de resultados sair do ar

`api.guidi.dev.br` é um projeto de terceiros (não é da Caixa), então pode
mudar de endereço. Se parar de funcionar, troque `BASE_URL` em `src/api.js`
por outra fonte compatível — por exemplo, a própria API interna da Caixa em
`https://servicebus2.caixa.gov.br/portaldeloterias/api/<loteria>`. A função
`normalize()` em `api.js` já tenta vários nomes de campo possíveis, mas vale
conferir o JSON retornado e ajustar se necessário.

## Colocar no ar (deploy)

O projeto é 100% estático depois do build — sobe em qualquer host de
arquivos estáticos. As opções mais simples e gratuitas:

**Vercel**
```bash
npm run build
npx vercel deploy --prod
```

**Netlify**
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Qualquer uma te dá um domínio próprio (ex: `conferidor.vercel.app`) na
hora, e um domínio customizado depois se quiser.

## Deixar o site "achável" pelo Google e por IAs (SEO + GEO)

Depois de publicar, faça isso:

1. **Troque `SEU-DOMINIO-AQUI.com`** pelo domínio real nos três arquivos:
   `index.html` (tags `canonical` e `og:url`), `public/robots.txt` e
   `public/sitemap.xml`.
2. **Google Search Console** — cadastre o site em
   [search.google.com/search-console](https://search.google.com/search-console),
   verifique a propriedade e envie o `sitemap.xml`. Isso acelera bastante o
   Google encontrar e indexar a página.
3. **`robots.txt`** já libera explicitamente os principais crawlers de IA
   (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, etc.), além
   dos buscadores normais.
4. **`llms.txt`** — segue a convenção [llmstxt.org](https://llmstxt.org),
   um resumo em texto simples do que o site faz, pensado para assistentes
   de IA lerem diretamente.

### Uma limitação importante para os robôs de IA

Este projeto é uma SPA em React puro (renderizada no navegador via
JavaScript). O Google consegue executar JavaScript e indexar o conteúdo
dinâmico razoavelmente bem, **mas a maioria dos crawlers de IA (GPTBot,
ClaudeBot e afins) não executa JavaScript** — eles só leem o HTML bruto do
servidor. Na prática, isso significa que esses robôs vão enxergar a
descrição estática (`<noscript>`, meta tags, `llms.txt`), mas não os
resultados de sorteio carregados dinamicamente pela API.

Se um dia você quiser que os *resultados em si* também sejam indexáveis por
IA, o caminho é migrar para um framework com renderização no servidor
(Next.js, Astro, etc.) ou gerar páginas estáticas por concurso — dá pra
fazer depois, sem jogar fora nada do que já está aqui.

## Privacidade

Os jogos fixos cadastrados ficam salvos apenas no `localStorage` do
navegador de quem está usando — nada é enviado a um servidor. Isso também
quer dizer que os jogos não aparecem em outro navegador ou dispositivo.
