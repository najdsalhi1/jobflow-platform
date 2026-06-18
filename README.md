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

## Stack

- **Frontend**: Next.js 14 + Tailwind CSS + shadcn/ui (Cloudflare Pages)
- **Backend**: Cloudflare Workers
- **Database**: Supabase PostgreSQL
- **Storage**: Cloudflare R2
- **LLM**: Gemini 2.0 Flash (primary), Groq (fast inference), Hermes 3 (local)
- **Orchestration**: n8n (self-hosted on Hetzner)
- **Email**: Resend + Hunter.io
- **Notifications**: Telegram Bot
