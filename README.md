# NewsDigest

A personal, AI-compiled morning news digest. A nightly job clusters stories from RSS feeds,
uses Claude to research and summarise the day's top topics (plus opinion/op-eds), and serves
the result as a fast, installable reader PWA.

## How it works

```
RSS feeds ──▶ cluster topics ──▶ Claude research + summarise ──▶ Neon Postgres ──▶ Next.js PWA
            (nightly GitHub Actions job)                                         (Vercel)
```

- A **GitHub Actions** cron job (`05:00 IST` / `23:30 UTC`) runs the compile pipeline,
  writes the finished digest to **Neon Postgres**, and exits. It runs in Actions rather than
  on Vercel because the compile (web search + summarisation) takes ~2 min — longer than
  serverless function limits.
- A **Next.js** app on Vercel (Hobby) reads from Neon and serves a date-addressable reader
  with topic detail, an opinion section, and a glossary. It's a PWA (service worker +
  manifest), so it installs to a phone home screen.

## Tech stack

- **Next.js 16** (App Router) + **React 19**, **Tailwind CSS v4**
- **@anthropic-ai/sdk** — Claude for research, clustering, and summarisation
- **@neondatabase/serverless** — serverless Postgres (tables auto-created on first write)
- **rss-parser** + **@extractus/article-extractor** — ingestion and full-text extraction
- **zod** — schema validation
- **tsx** — running the TypeScript compile/probe scripts

## Project layout

```
app/                Next.js routes — reader (/[date]), topic & opinion pages, API routes
components/         UI: TodayView, TopicCard/Detail, OpEdCard, DatePicker, glossary, tabs
lib/                Pipeline + data layer — feeds, scrape, cluster, research, compile,
                    opeds, anthropic, db/storage/store, format, types
scripts/            Compile runner and feed/source probes (run with tsx)
.github/workflows/  daily-digest.yml — the nightly compile cron
DEPLOY.md           Full deployment walkthrough (Neon, secrets, Vercel)
```

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Set the required environment variables (see `DEPLOY.md`):

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Calls Claude during compile/research |
| `DATABASE_URL` | Neon pooled connection string |

Optional overrides (`DIGEST_MODEL`, `RESEARCH_MODEL`, `TOP_RESEARCHED`) have defaults in code.

Compile a digest manually:

```bash
npx tsx scripts/run-compile.ts        # needs ANTHROPIC_API_KEY + DATABASE_URL
```

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for the full walkthrough: creating the Neon database, setting
the GitHub Actions secrets, and deploying the reader to Vercel. The nightly job can also be
triggered manually from the Actions tab or with `gh workflow run`.
