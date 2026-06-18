# JobFlow

Automated job application & outreach platform targeting 5 EU countries (Poland, Romania, Malta, Germany, Netherlands).

## Pre-Phase 2 Checklist

### Phase 0 — Manual Signups (you need to do these)

| # | Item | Status | Where | Time |
|---|------|--------|-------|------|
| 1 | GitHub repo | ✅ | najdsalhi1/jobflow-platform | — |
| 2 | Supabase project | ✅ | hsdldaxoafnpumugpanf (us-east-2) | — |
| 3 | Cloudflare account | ✅ | Connected via MCP + API | — |
| 4 | **GEMINI_API_KEY** | 🔲 | [aistudio.google.com](https://aistudio.google.com) | 2 min |
| 5 | **GROQ_API_KEY** | 🔲 | [console.groq.com](https://console.groq.com) | 2 min |
| 6 | **Telegram bot token** | 🔲 | [@BotFather](https://t.me/botfather) — create bot, get token + chat_id | 3 min |
| 7 | **Apify API token** | 🔲 | [apify.com](https://apify.com) — free tier ($5 compute) | 2 min |
| 8 | **Hunter.io API key** | 🔲 | [hunter.io](https://hunter.io) — 25 free searches/month | 2 min |
| 9 | Resend account + domain | 🔲 | [resend.com](https://resend.com) — verify najdsalhi1.com, SPF/DKIM/DMARC | 15 min |
| 10 | Hetzner CAX11 server | 🔲 | [hetzner.com/cloud](https://hetzner.com/cloud) — Frankfurt, Ubuntu 24.04 | 5 min |
| 11 | Start Resend domain warmup | 🔲 | Start ASAP — needs 21 days before bulk sending (Phase 4) | 5 min |

> **Getting started:** Items 4–7 are needed for Phase 2 (Job Discovery). You can sign up for all in ~10 minutes.

### Phase 1 — Foundation (done ✅)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Database schema (15 tables) | ✅ | jobs, applications, interviews, offers, contacts, email_sequences, company_research, cv_templates, visa_tracker, certifications_tracker, analytics_daily, content_queue, daily_tasks, system_health, prompt_performance |
| 2 | Row-level security | ✅ | RLS + policies on all user-specific tables |
| 3 | Performance indexes | ✅ | 14 indexes on FK + query columns |
| 4 | pg_cron GDPR purge | ✅ | 90-day auto-purge every Sunday 02:00 UTC |
| 5 | Next.js scaffold | ✅ | TypeScript + Tailwind CSS v4 + shadcn/ui |
| 6 | Dashboard pages | ✅ | 12 routes with Notion-inspired UI |
| 7 | Supabase client | ✅ | Connected |
| 8 | Render deployment | ✅ | [jobflow-dashboard.onrender.com](https://jobflow-dashboard.onrender.com/dashboard) |
| 9 | Cloudflare Pages project | ✅ | jobflow-dashboard.pages.dev (ready for migration) |
| 10 | Supabase env vars on Render | ✅ | NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY set |

### Phase 2 — Job Discovery Engine (code written, blocked on API keys)

The worker is ready at `workers/job-discovery/`. It:

1. Runs daily at 05:00 UTC via cron trigger
2. Scrapes 5 countries × 3-4 job boards each via Apify (with retry + exponential backoff)
3. Deduplicates against existing Supabase `jobs` table
4. Filters stale listings (age > 21 days)
5. Detects language (en/de/pl/ro/nl) via Groq
6. Scores each job (1-10) with CV track routing via Groq (llama-3.1-8b-instant)
7. Applies age penalty for listings >14 or >21 days old
8. Inserts scored jobs to Supabase
9. Queues top jobs (score ≥ 7) for application generation
10. Sends Telegram morning summary

**To deploy once API keys are obtained:**

```bash
cd workers/job-discovery
npm install
npx wrangler deploy
```

Secrets to set:
- `APIFY_API_TOKEN` — from apify.com
- `GROQ_API_KEY` — from console.groq.com
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — from @BotFather
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` — from Supabase dashboard

### Phase 2.5 — Cloudflare Pages Migration (optional, after Phase 2)

To migrate the Next.js frontend from Render to Cloudflare Pages:

```bash
npm create cloudflare@latest -- jobflow-platform --framework=next
```

Or follow the [Cloudflare Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

## Stack

- **Frontend**: Next.js 16 + Tailwind CSS v4 + shadcn/ui (Render → Cloudflare Pages)
- **Backend**: Cloudflare Workers
- **Database**: Supabase PostgreSQL
- **Storage**: Cloudflare R2
- **LLM**: Gemini 2.0 Flash (primary), Groq (fast inference), Hermes 3 (local, Phase 5)
- **Orchestration**: n8n (self-hosted on Hetzner, Phase 5)
- **Email**: Resend + Hunter.io
- **Notifications**: Telegram Bot
