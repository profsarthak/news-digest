# NewsDigest

A personal, install-to-your-phone news reader. Once a day it pulls the last 24h from a set of
outlets you choose, **groups stories that cover the same event across outlets into one topic**, and
for each topic writes a plain-English explainer, a jargon glossary, and (for the biggest stories)
web-search-backed context and implications. It also curates a few **op-eds** on a separate Opinion
tab. You open it with coffee and read.

🔗 **Live demo: [news-digest-theta.vercel.app](https://news-digest-theta.vercel.app/)** — the reader, with the full archive
of its daily run, 9 June – 30 July 2026. The daily compile has ended, so no new digests are added.

Built with Next.js + Claude. It's a personal project, but it's designed to be **forked and made your
own** — different countries, outlets, languages, models, and budgets. This README is the guide for
doing that.

> ⚠️ **Running it costs money** (Anthropic API — roughly **$0.33/day (~$10/month)** at the defaults).
> Nothing runs until *you* wire in your own API key and database. See [Cost](#cost) and
> [Pausing to stop spend](#pausing--stopping-spend).

---

## What it does

- **Cross-outlet clustering** — the same story from 5 outlets becomes one topic, not five cards.
- **Plain-English explainer** per topic, synthesizing (not just concatenating) the coverage.
- **Inline glossary** — jargon terms are tappable for a one-line definition.
- **Context + implications** — web-search-backed, on the top few topics of the day.
- **Opinion tab** — a handful of curated op-eds with a neutral summary + "which way it leans".
- **Installable PWA** — add to your Android/desktop home screen; reads offline.
- **Fully automated** — a daily GitHub Actions job compiles everything; the site just reads it.

---

## How it works

```
GitHub Actions (daily cron)                         Vercel (always-on, free)
┌──────────────────────────────────────┐            ┌───────────────────────────┐
│ scripts/run-compile.ts                │            │ Next.js app (reader PWA)  │
│  1. fetch RSS/Google-News feeds       │  writes    │  reads today's digest     │
│  2. Claude (Sonnet): cluster topics   │ ────────►  │  from Neon and renders it │
│  3. Claude: explainer + glossary      │   Neon     │  /            → today      │
│     + web-search context/implications │  Postgres  │  /[date]      → history    │
│  4. Claude (Haiku): pick + summarise  │ ◄────────  │  /[date]/opinion → op-eds  │
│     op-eds                            │   reads    │                           │
│  5. store one JSONB row per day       │            └───────────────────────────┘
└──────────────────────────────────────┘
```

**Why the split?** The compile takes ~2 minutes (web search + many model calls), which exceeds
serverless function timeouts. So the heavy lifting runs in **GitHub Actions** (generous limits, free
for personal use) and writes to **Neon Postgres**; **Vercel** only serves the lightweight reader.

**Tech:** Next.js 16 (App Router, TypeScript) · Tailwind v4 · `@anthropic-ai/sdk` (Sonnet + Haiku) ·
`rss-parser` · `@extractus/article-extractor` · `@neondatabase/serverless`.

---

## Cost

Measured at the defaults (10 topics, web search on the top 4, 4 op-eds), on a real run:

| Step | Model | ~Cost/run |
|------|-------|----------:|
| Cluster topics | Sonnet | $0.02 |
| Explainers + context/implications (×10) | Sonnet | $0.12 |
| Web-search research (top 4) | Haiku | $0.17 |
| Op-ed select + summarise (4) | Sonnet + Haiku | $0.01 |
| **Total** | | **~$0.33/day (~$10/mo)** |

**The web-search research is ~half the cost.** To spend less: lower `TOP_RESEARCHED`, drop web search
entirely, use Haiku more, or reduce topic/op-ed counts — see [Customize](#customize).

---

## Quickstart (local)

**Prerequisites:** Node 22+, an [Anthropic API key](https://console.anthropic.com), and (optional for
local) a [Neon](https://neon.tech) database. Without `DATABASE_URL`, the app stores digests as local
JSON files under `.data/` and the reader falls back to a bundled sample.

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<you>/news-digest && cd news-digest
npm install

# 2. Configure secrets
cp .env.example .env.local     # then edit .env.local:
#   ANTHROPIC_API_KEY=sk-ant-...
#   CRON_SECRET=any-random-string
#   DATABASE_URL=            # leave blank to use local JSON storage

# 3. Compile one digest (calls the API — costs a few cents)
node --env-file=.env.local --import tsx scripts/run-compile.ts

# 4. Run the reader
npm run dev                    # http://localhost:3000
```

`run-compile.ts` prints a full token/cost breakdown at the end so you can see exactly what a run
costs before automating it.

**Deploying** (GitHub Actions + Neon + Vercel) is documented step-by-step in **[DEPLOY.md](./DEPLOY.md)**.

---

## Customize

This is the part that makes it *yours*. Almost everything is a small, isolated change.

### Change the outlets (news)

Edit `OUTLETS` in [`lib/feeds.ts`](./lib/feeds.ts). Each entry is `{ name, url, paywalled? }`:

```ts
export const OUTLETS: Outlet[] = [
  { name: "Indian Express", url: "https://indianexpress.com/feed/" },
  { name: "Financial Times", url: "https://www.ft.com/rss/home", paywalled: true },
  { name: "Scroll",          url: "https://feeds.feedburner.com/ScrollinArticles" },
  { name: "The Wire",        url: googleNews("thewire.in") },   // sites that block RSS
  { name: "The Ken",         url: googleNews("the-ken.com"), paywalled: true },
];
```

- Prefer a real **RSS feed** where one exists (richer blurbs, direct links).
- For sites that block RSS / serve a bot page, use the `googleNews("domain.com")` helper — it queries
  Google News scoped to that domain (headline + link only).
- Mark subscription sites `paywalled: true` — they're never scraped and stay headline-only.
- Non-paywalled outlets with **direct** article URLs get full-text scraped automatically (that text
  feeds the explainer). Google-News-sourced outlets are headline-only (redirect links).
- **Verify your feeds first:** `npx tsx scripts/probe-feeds.ts` (and `probe-opinion.ts`) tell you
  which URLs actually return items — many "obvious" feed URLs 404 or return HTML.

### Change the op-ed sources

Edit `OPINION_FEEDS` in the same file. Only outlets with a clean, dedicated opinion feed work well.
The op-ed selector guarantees at least one **Indian Express** pick (`INDIA_OUTLET` in
[`lib/opeds.ts`](./lib/opeds.ts)) — change or delete that constant to drop/retarget the guarantee.

### Models & budget

Defaults live in [`lib/anthropic.ts`](./lib/anthropic.ts) and are overridable by env var:

| Env var | Default | Used for |
|---------|---------|----------|
| `DIGEST_MODEL` | `claude-sonnet-4-6` | clustering + explainers |
| `RESEARCH_MODEL` | `claude-haiku-4-5` | web-search context/implications |
| `OPED_MODEL` | `claude-haiku-4-5` | op-ed summaries |

### Tuning knobs (env vars)

| Env var | Default | Effect |
|---------|---------|--------|
| `TOP_RESEARCHED` | `4` | How many top topics get paid web-search context/implications (0 = none, cheapest). |
| `OPED_COUNT` | `4` | Number of op-eds per day. |

Other knobs in code: the 24h/48h feed windows and per-outlet caps in `fetchRecentItems` /
`fetchOpinionItems` (`lib/feeds.ts`); topic count is decided by the clustering prompt in
`lib/cluster.ts`.

### Schedule & timezone

The digest is keyed to the **Indian** calendar day. To change:
- **When it runs:** the `cron` in [`.github/workflows/daily-digest.yml`](./.github/workflows/daily-digest.yml)
  (`30 23 * * *` UTC = 05:00 IST). Note GitHub cron is UTC.
- **Which day it's labeled:** `Asia/Kolkata` in the `istDate()` helper in
  [`app/api/cron/compile/route.ts`](./app/api/cron/compile/route.ts) and
  [`scripts/run-compile.ts`](./scripts/run-compile.ts) — change both to your timezone.

### Look & feel

The UI uses my personal design system — a brutalist treatment: **square corners**, **1.5px ink
borders**, **hard offset shadows** (`5px 5px 0`, no blur), warm bone/paper surfaces, and a single hot
orange accent used as "the signal". Type is **Space Grotesk** (display), **IBM Plex Sans** (body),
**Space Mono** (labels/metadata).

Swapping in your own brand is a two-file job:

- **Tokens** — colors, fonts, and shadows are all CSS variables + a Tailwind `@theme` block at the
  top of [`app/globals.css`](./app/globals.css). Change the hex values and every component follows.
- **Fonts** — [`app/layout.tsx`](./app/layout.tsx) loads the three faces via `next/font/google`;
  swap the imports and the `--font-*` variables.
- **PWA name/icons** — [`app/manifest.ts`](./app/manifest.ts); regenerate icons with
  `node --import tsx scripts/make-icons.ts` after editing the SVG in that script.

Want the soft, rounded look instead? Drop the `shadow-card` / `border-[1.5px]` classes in
`components/` and add `rounded-2xl` — nothing else depends on the shape treatment.

---

## Project structure

```
app/
  page.tsx                     # Today (latest news)
  [date]/page.tsx              # A day's news
  [date]/[id]/page.tsx         # Topic detail
  [date]/opinion/page.tsx      # A day's op-eds
  api/cron/compile/route.ts    # Manual/authenticated compile trigger
  api/digest/[date]/route.ts   # Read a digest as JSON
lib/
  feeds.ts        # OUTLETS + OPINION_FEEDS, fetch/normalize/scrape-flag
  cluster.ts      # Claude clustering (structured output)
  compile.ts      # per-topic explainer/glossary + orchestration
  research.ts     # Haiku web-search context/implications
  opeds.ts        # op-ed selection (Sonnet) + summarise (Haiku)
  scrape.ts       # full-article extraction
  storage.ts      # backend selector: Neon if DATABASE_URL, else local JSON
  db.ts / store.ts# the two storage backends
  data.ts         # read seam used by the pages
  anthropic.ts    # shared client, model config, usage/cost tracking
  types.ts, util.ts
components/        # TopicCard, TopicDetail, OpEdCard, SectionTabs, GlossaryText, …
scripts/          # run-compile, rotate-secrets, make-icons, probe-*, test-*
.github/workflows/daily-digest.yml   # the nightly compile
```

## Secrets & repo variables

**GitHub Actions secrets** (Settings → Secrets and variables → Actions): `ANTHROPIC_API_KEY`,
`DATABASE_URL`.
**Vercel env** (production): `DATABASE_URL`.
**Optional repo *variables*** to override defaults without code changes: `DIGEST_MODEL`,
`RESEARCH_MODEL`, `OPED_MODEL`, `TOP_RESEARCHED`, `OPED_COUNT`.

Rotating any of these later: `npm run rotate-secrets` updates the GitHub secret, Vercel env, and your
local `.env.local` in one pass (see [DEPLOY.md](./DEPLOY.md#rotating-credentials-one-command)).

## Pausing / stopping spend

Nothing runs unless the GitHub Actions job runs. To stop the daily API spend:

- **Pause:** GitHub → repo → **Actions** → *Daily Digest* → **⋯ → Disable workflow**. (Re-enable any
  time.) The Vercel reader keeps serving the last compiled digest for free.
- **Fully stop:** delete `.github/workflows/daily-digest.yml`, or remove the `ANTHROPIC_API_KEY`
  secret.

## Gotchas we hit (so you don't)

- **Vercel framework preset must be Next.js.** If you first run `vercel link` from the wrong folder,
  Vercel may save the project as "Other" and serve your `public/` folder statically (→ 404s). Fix in
  Project Settings → Build & Deployment → Framework Preset.
- **Many outlets block direct RSS** (bot interstitials / 403). Use the Google-News `site:` fallback.
- **Haiku + web search** needs `allowed_callers: ["direct"]` on the tool (already set in
  `lib/research.ts`).
- **Verify feed URLs** with the probe scripts before trusting them — feed paths change and 404 often.

## Disclaimer

Personal project. It reads public RSS/headlines and links back to each outlet — it does **not**
republish paywalled full text. Respect each outlet's Terms of Service and use your own subscriptions
to read full articles. No warranty; you run it at your own cost and risk.
