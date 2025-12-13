# Deployment (Afribac)

This is a pragmatic checklist for deploying Afribac (web) + Supabase.

## 1) Supabase (production)

- Create a Supabase project (prod).
- Apply migrations from `supabase/migrations/`:
  - using Supabase CLI against prod, or
  - using the Supabase dashboard SQL editor (not recommended long-term).

### Required buckets/policies

Migrations create and secure:
- `avatars`
- `course-materials`
- `gallery-assets`

## 2) Vercel (or similar)

Deploy the Next.js app and set environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 3) Post-deploy smoke test (must pass)

- **Auth**
  - Sign up → email confirm / callback works → lands in onboarding → then `/dashboard`
  - Sign in → `/dashboard`
- **Permissions**
  - Student cannot access `/dashboard/admin/*`
  - Member cannot manage global countries/series/subjects
  - Country isolation is enforced (RLS)
- **Content**
  - Member/admin can create and publish a course
  - Student can view published course content
- **Uploads**
  - Avatar upload works
  - Course materials upload works (for member/admin)

## 4) Common prod pitfalls

- Wrong Supabase URL/key in Vercel env vars → auth fails everywhere.
- Missing redirect URLs in Supabase Auth settings → OAuth/email-confirm callbacks fail.
- RLS mismatch: if you add tables/fields, make sure policies are updated.


