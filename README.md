# Stitch Counter

A mobile-friendly web app for counting stitches and rows while knitting or crocheting. Track multiple counters per project, build pattern checklists with notes, and sync across devices with Supabase.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy
- **Auth / DB:** Supabase (optional for Phase 1 local-only mode)
- **AI:** Gemini for pattern parsing (Phase 4)

## Quick start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Use `npm run dev` with `--host` (already configured) to test on your phone over the same Wi-Fi.

### 2. Backend

**Requires Python 3.12 or 3.13** — Python 3.14 is too new for some dependencies (Pydantic, psycopg2).

```bash
cd backend
rm -rf venv
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs: `http://localhost:8000/docs`

Local dev uses **SQLite** by default — no Postgres install needed. If you later point `DATABASE_URL` at Supabase Postgres, also run:

```bash
pip install -r requirements-postgres.txt
```

### 3. Environment variables

Copy `.env.example` to `.env` in the project root and fill in values as needed.

**Phase 1 works without any env vars** — projects save to `localStorage`.

For cloud sync and pattern import:

- Create a [Supabase](https://supabase.com) project
- Enable Email and Google auth providers
- Copy project URL, anon key, and JWT secret
- In Supabase **Authentication → URL Configuration**, set:
  - **Site URL:** `http://localhost:5173`
  - **Redirect URLs:** `http://localhost:5173/**`
- Set `SUPABASE_URL` in `backend/.env` to the **same** project URL as `VITE_SUPABASE_URL` in `frontend/.env`
- Add a `GEMINI_API_KEY` for AI pattern parsing
- Install [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) if you want image/screenshot parsing

## Features

### Phase 1 — Core counter
- Stitch and row counters with +/−/reset
- Multiple counters per project
- Local persistence via `localStorage`
- Responsive, thumb-friendly UI

### Phase 2 — Cloud sync
- Supabase login (email + Google)
- JWT-protected FastAPI routes
- Migrate local projects to cloud on first login

### Phase 3 — Pattern checklist
- Row-by-row checklist with completion toggles
- Per-row notes
- Manual row entry

### Phase 4 — AI pattern import
- Upload PDF or image
- Extract text (PDF parser or OCR)
- Gemini converts pattern into structured checklist
- Review preview before saving

## Project structure

```
stitch-counter/
├── frontend/          # React app
├── backend/           # FastAPI API
├── .env.example
└── README.md
```

## Development notes

- Frontend proxies `/api` to `http://localhost:8000` in dev
- Backend defaults to SQLite (`backend/stitch_counter.db`) for local development
- Set `DATABASE_URL` to a Supabase Postgres connection string for production
- Pattern parsing requires sign-in and a configured `GEMINI_API_KEY`
