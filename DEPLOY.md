# Deploying NewsDigest

Architecture: a nightly **GitHub Actions** job compiles the digest and writes it to
**Neon Postgres**; a **Vercel** (free Hobby) app serves the reader PWA, reading from Neon.
The compile runs in Actions (not Vercel) because it takes ~2 min — longer than serverless
function limits.

Run the steps in order. Commands work from the project root in your terminal.

---

## 1. Rotate the Anthropic API key (do this first)

The previous key was shared in chat. Create a fresh one and discard the old:

- Go to https://console.anthropic.com → **API Keys** → create a new key. Copy it.
- (Optional) delete/disable the old key.

## 2. Create a free Neon database

- Go to https://neon.tech → sign in → **New Project** (any region; pick one near you).
- Open the project → **Connection string** → copy the **pooled** `postgresql://…` URL.
  This is your `DATABASE_URL`. (It already includes `?sslmode=require`.)

No need to create tables — the app runs `CREATE TABLE IF NOT EXISTS` on first write.

## 3. Set the GitHub Actions secrets

These let the nightly job call Claude and write to Neon. Run each, then paste the value
at the prompt (avoids putting secrets in shell history):

```bash
gh secret set ANTHROPIC_API_KEY --repo profsarthak/news-digest
gh secret set DATABASE_URL      --repo profsarthak/news-digest
```

Verify:

```bash
gh secret list --repo profsarthak/news-digest
```

## 4. Run the first compile

Trigger the workflow manually (it's also scheduled daily at 05:00 IST):

```bash
gh workflow run "Daily Digest" --repo profsarthak/news-digest
gh run watch --repo profsarthak/news-digest      # follow until it finishes
```

When it succeeds, today's digest is in Neon. The run log prints the cost breakdown.

## 5. Deploy the reader to Vercel

```bash
npm i -g vercel
vercel login                      # opens browser
vercel link                       # from project root; create a new project "news-digest"
vercel env add DATABASE_URL production   # paste the same Neon URL
vercel --prod                     # build + deploy
```

Vercel prints your live URL (e.g. `https://news-digest-xxxx.vercel.app`).

> The reader only needs `DATABASE_URL`. It does **not** need the Anthropic key
> (no compiling happens on Vercel). The unused `/api/cron/compile` route and
> `vercel.json` cron are harmless — we compile via GitHub Actions instead.

## 6. Install on your Android phone

- Open the Vercel URL in **Chrome** on Android.
- Menu (⋮) → **Add to Home screen** → it installs as a standalone app (NewsDigest icon).

---

## Tuning later (optional)

Set these as GitHub Actions **repository variables** (Settings → Secrets and variables →
Actions → Variables) to override the defaults — no code change needed:

| Variable | Default | Effect |
|----------|---------|--------|
| `TOP_RESEARCHED` | `4` | How many top topics get the paid web-search context/implications (~$9/mo at 4). |
| `DIGEST_MODEL` | `claude-sonnet-4-6` | Model for clustering + explainers. |
| `RESEARCH_MODEL` | `claude-haiku-4-5` | Model for the web-search research step. |

## Rotating credentials (one command)

Each secret lives in up to three places (GitHub Actions secret, Vercel production env,
local `.env.local`). To rotate without doing it three times by hand:

```bash
npm run rotate-secrets
```

- Prompts for each secret (hidden input). **Leave blank to skip** one you're not changing.
- Propagates each to all the places it belongs (`ANTHROPIC_API_KEY` → GitHub + local;
  `DATABASE_URL` → GitHub + Vercel + local).
- Offers to run `vercel --prod` afterward (required for Vercel env changes to take effect).

Preview without changing anything:

```bash
DRY_RUN=1 npm run rotate-secrets
```

Non-interactive (e.g. piping from a password manager):

```bash
NEW_ANTHROPIC_API_KEY=sk-... NEW_DATABASE_URL=postgresql://... npm run rotate-secrets
```

Destinations per secret are defined in `scripts/rotate-secrets.mjs` (edit the `SECRETS` map
to add more, e.g. `CRON_SECRET`).

## Notes

- **Cost:** ~$0.31/run (~$9/month) at the current settings — see the Actions run log for the
  exact per-run breakdown.
- **Auth:** the reader is currently public (obscure URL). A simple password gate via
  `middleware.ts` + `BASIC_AUTH_PASSWORD` can be added if you want it — not yet implemented.
- **Schedule:** edit the `cron` in `.github/workflows/daily-digest.yml` to change run time
  (it's in UTC; `30 23 * * *` = 05:00 IST).
