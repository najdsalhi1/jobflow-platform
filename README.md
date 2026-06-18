# JobFlow

Automated job application & outreach platform.

## Phase 0 — Prerequisites (TO DO)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | GitHub repo | ✅ | najdsalhi1/jobflow-platform |
| 2 | Supabase project | ✅ | hsdldaxoafnpumugpanf (us-east-2) |
| 3 | Cloudflare account | ✅ | Connected via MCP |
| 4 | GEMINI_API_KEY | 🔲 | Sign up at aistudio.google.com |
| 5 | GROQ_API_KEY | 🔲 | Sign up at console.groq.com |
| 6 | Telegram bot token | 🔲 | Create via BotFather |
| 7 | Resend account + domain | 🔲 | Sign up at resend.com, verify najdsalhi1.com |
| 8 | Hetzner CAX11 server | 🔲 | Order at hetzner.com/cloud (Frankfurt, Ubuntu 24.04) |
| 9 | Apify API token | 🔲 | Sign up at apify.com |
| 10 | Hunter.io API key | 🔲 | Sign up at hunter.io |

## Phase 1 — Database & Dashboard

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Database schema (15 tables) | ✅ | jobs, applications, interviews, offers, contacts, email_sequences, company_research, cv_templates, visa_tracker, certifications_tracker, analytics_daily, content_queue, daily_tasks, system_health, prompt_performance |
| 2 | Row-level security | ✅ | RLS enabled + policies on all user-specific tables |
| 3 | Performance indexes | ✅ | 14 indexes on foreign keys + query columns |
| 4 | pg_cron GDPR purge | ✅ | 90-day auto-purge of stale data |
| 5 | Next.js scaffold | ✅ | TypeScript + Tailwind CSS + shadcn/ui |
| 6 | Dashboard pages | ✅ | 12 routes: /, pipeline, jobs, outreach, interviews, offers, visas, certs, analytics, settings/health, settings/cv-tracks |
| 7 | Notion-inspired UI | ✅ | Warm paper (#f6f5f4) canvas, blue (#0075de) accent, Inter font |
| 8 | Supabase client | ✅ | Connected via @supabase/supabase-js |

## Stack

- **Frontend**: Next.js 16 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Cloudflare Workers (Phase 2)
- **Database**: Supabase PostgreSQL
- **Storage**: Cloudflare R2
- **LLM**: Gemini 2.0 Flash (primary), Groq (fast inference), Hermes 3 (local)
- **Orchestration**: n8n (self-hosted on Hetzner)
- **Email**: Resend + Hunter.io
- **Notifications**: Telegram Bot
