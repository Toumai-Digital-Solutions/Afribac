# Afribac (Web)

Afribac is an **educational platform for African baccalauréat preparation** built with **Next.js 15** + **Supabase**.

## What’s in this repo

- **Frontend**: Next.js App Router, TailwindCSS, shadcn/ui
- **Auth/DB/Storage**: Supabase (SSR + RLS)
- **Roles**: `admin` / `member` (collaborator) / `user` (student)

## Prerequisites

- **Bun** (project package manager)
- A **Supabase project** (local via Supabase CLI or a hosted Supabase project)

## Environment variables

Create `.env.local` at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

## Run locally (bun)

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Database & migrations (Supabase)

Database migrations live in `supabase/migrations/`.

- Local Supabase workflow: see `docs/LOCAL_SETUP.md`
- Deployment workflow: see `docs/DEPLOYMENT.md`

## Docs

- `docs/platform-analysis.md`: current state analysis (done/partial/missing + roadmap)
- `docs/LOCAL_SETUP.md`: local Supabase setup
- `docs/DEPLOYMENT.md`: production checklist
