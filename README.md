# Design System Picker

A production-ready web app where design studios send clients an invite link to pick design rules (colors, fonts, spacing, shape, voice) with live preview. The studio reviews, approves, and exports rules as design tokens.

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Then open http://localhost:3000 and sign in with the seeded admin account.

## Seeded accounts

| Email | Password | Role |
|-------|----------|------|
| admin@studio.com | Admin1234! | Admin |
| designer@studio.com | Design1234! | Designer |

## Running without Docker (development)

**Prerequisites:** Node.js 20+, Python 3.12+, PostgreSQL 14+, [uv](https://github.com/astral-sh/uv)

### Backend

```bash
cd api
cp ../.env.example .env
# Edit .env to set DATABASE_URL and DATABASE_SYNC_URL to your local PostgreSQL

uv sync
uv run alembic upgrade head
uv run python scripts/seed.py
uv run uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

## User flows

### Studio workflow

1. Sign in at `/login`
2. Create a project at `/dashboard`
3. Generate an invite link on the project detail page
4. Share the link with the client
5. When the client submits, review the submission
6. Approve or request changes
7. When approved, download design tokens (CSS, Tailwind, W3C JSON, Figma)

### Client workflow

1. Open the invite link (e.g. `/pick/abc123`)
2. Walk through the 6-step picker wizard:
   - Welcome
   - Colors (primary, secondary, neutral, background)
   - Fonts (heading, body, optional Khmer fonts)
   - Shape (radius, density, shadow, button style)
   - Voice (tone + notes)
   - Review & submit
3. Progress is auto-saved as a draft after each change

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4, shadcn-style components |
| Backend | Python 3.12, FastAPI, SQLAlchemy async, Alembic |
| Database | PostgreSQL with JSONB for design rules |
| Auth | Argon2 passwords, JWT in httpOnly cookies |
| State | TanStack Query v5 |

## Export formats

- **CSS Variables** — ready to paste into any stylesheet
- **Tailwind v4 `@theme`** — drop into `globals.css`
- **W3C Design Tokens JSON** — for toolchain integration
- **Figma Tokens JSON** — for Figma Token Studio plugin

## Environment variables

See `.env.example` for all variables. Required for production:

- `SECRET_KEY` — 32+ random bytes (never use the default)
- `DATABASE_URL` — PostgreSQL async connection string
- `DATABASE_SYNC_URL` — PostgreSQL sync connection string (Alembic)
- `FRONTEND_URL` — Your app's public URL (for CORS)

Optional notification settings:
- `EMAIL_BACKEND=smtp` with `SMTP_*` variables for email notifications
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` for Telegram notifications

## Running tests

```bash
# Backend unit + integration tests
cd api
uv run pytest

# Frontend type check
cd web
npx tsc --noEmit
```
