# Local Setup (Afribac)

This guide explains how to run Afribac locally with Supabase.

## 1) Prerequisites

- **Bun** (project package manager)
- **Supabase CLI** (recommended) + Docker (for local Supabase)

## 2) Environment variables

Create `.env.local` at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

If you run Supabase locally, you’ll set these to your local Supabase URL/anon key.

## 3) Install dependencies

```bash
bun install
```

## 4) Start Supabase (local)

From the project root:

```bash
supabase start
```

Then apply migrations:

```bash
supabase db reset
```

This will run SQL migrations from `supabase/migrations/` (and seed data if configured).

## 5) Run the app

```bash
bun run dev
```

Open `http://localhost:3000`.

## 6) Quick verification checklist

- Sign up, then confirm onboarding redirects:
  - missing name → `/auth/onboarding/name`
  - missing country/series → `/auth/onboarding/location`
  - complete profile → `/dashboard`
- Access control:
  - logged-out users trying `/dashboard` → redirected to `/auth/signin`
  - students only see `publish` courses (enforced by RLS)

## Troubleshooting

### “Missing Supabase environment variables…”

You must set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Local Supabase not starting

Ensure Docker is running and `supabase` CLI is installed.


