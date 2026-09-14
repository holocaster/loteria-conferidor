# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # vite dev server, http://localhost:5173
npm run build             # production build to dist/
npm run preview           # serve the production build locally
npm run lint               # oxlint
npm test                    # vitest run (all unit tests)
npm test -- src/api.test.js # single unit test file
npm run test:e2e            # playwright, starts the dev server automatically
npm run test:e2e:headed     # same, headed + slowMo(500)
npx playwright test e2e/premio.spec.js  # single e2e spec
```

There is no backend and no database — this is a 100% client-side static
site (see "Architecture" below).

## Architecture

**Client-only SPA, no backend.** Everything runs in the browser: draw
results come from a direct `fetch` to a third-party API, and saved games
live only in `localStorage`. There is no server component to reason about.

- **`src/api.js`** — fetches and normalizes draw results from the Caixa API
  (`servicebus2.caixa.gov.br`). `normalize()` tries several possible field
  names per value (the API's shape varies slightly by endpoint/lottery) and
  handles Dupla-Sena's second draw (`listaDezenasSegundoSorteio`)
  separately from the first. `fetchDrawRange()` fetches a list of concursos
  sequentially, isolating one concurso's failure from the rest (a failed
  item becomes an inline error, not an aborted batch) — see `docs/CONTEXT.md`
  for why. **Do not switch the data source without re-verifying CORS live**
  — the previous source (`api.guidi.dev.br`) silently failed in the browser
  because it didn't send `Access-Control-Allow-Origin`; that's the one thing
  a local/curl test won't catch.
- **`src/lotteries.js`** — per-lottery config (`LOTTERIES`): how many
  numbers to pick, valid range, and the minimum hit count that counts as a
  prize (`prizeFrom`, used only for highlighting in the UI, not fetched
  from the API). Also `countHits()` (numbers-in-common) and
  `findPrizeValue()` (looks up the payout for a hit count in
  `listaRateioPremio`, correctly slicing Dupla-Sena's doubled list by
  segment/segments since it reports two draws per concurso).
- **`src/intervalValidation.js`** — pure validation for the "de/até" range
  mode; no fetch, no React. Caps a range at `MAX_INTERVALO` (25) — a product
  choice, not an API rate limit.
- **`src/storage.js`** — `localStorage` CRUD for saved games. Per-browser
  only; nothing is synced or sent anywhere.
- **`src/App.jsx`** — top-level state and the three fetch modes (last draw /
  specific concurso / de-até range). Note `activeSlugRef`: when the user
  switches lottery tabs mid-range-fetch, in-flight results for the
  abandoned lottery must stop writing into state — the ref (not the
  `activeSlug` state closure) is what the range's progress callback checks.
- **`src/DrawTicket.jsx`** — stateless rendering of one concurso's result
  plus the hit/prize comparison against the games passed in; reused for
  every item in both single-result and range-list views.
- **`src/NumberPicker.jsx`** — the number-grid picker used when registering
  a new game.

### Domain vocabulary and decisions

`docs/CONTEXT.md` is the source of truth for domain terms (concurso,
dezena, jogo fixo, acerto, Dupla-Sena's two draws) and for the reasoning
behind the API choice, the "HTTP 500 means unavailable, not necessarily
nonexistent" handling, the 25-item interval cap, and per-item failure
isolation. Read it before changing `api.js` or the range-fetch flow — most
non-obvious behavior there is a deliberate, previously-tested decision, not
an oversight.

### Feature workflow (spec-driven)

This repo tracks feature work with a lightweight spec/ticket flow, not ad
hoc commits:

- `.ai/PROJECT_STATE.md` — current feature, active ticket, next action.
- `docs/briefs/<NNNN-slug>.md` → `docs/specs/<NNNN-slug>.md` →
  `tickets/<NNNN-slug>/NN-*.md` (each ticket has a matching
  `NN-*.review.md`).

Check `.ai/PROJECT_STATE.md` for what's in flight before starting new
feature work.

### Deploy

Static build (`dist/`) deployable anywhere. `deploy/nginx/*.conf` and
`deploy/build-and-run.sh` are the actual production path (self-hosted VPS,
pull-based `git pull` + nginx reload — see README for the Vercel/Netlify
alternative).
