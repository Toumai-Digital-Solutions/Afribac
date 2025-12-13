# 🚀 Afribac — Todo (re-scoped from codebase analysis)

Last updated: 2025-12-13

## ✅ Checkbox Legend
- **First checkbox** 🤖 **Implementation** (coded)
- **Second checkbox** 👤 **Testing** (you validated it works end-to-end)

## 📌 What’s already implemented in the codebase (baseline)
- [x] [ ] Next.js 15 App Router + Tailwind + shadcn/ui foundation
- [x] [ ] Supabase SSR client + middleware session refresh + auth callback
- [x] [ ] Database schema + RLS (countries/series/subjects/courses/exams/quizzes/progress/attempts)
- [x] [ ] Role model: `admin` / `member` / `user` (student)
- [x] [ ] `/dashboard` role routing + onboarding gates (name + location/series)
- [x] [ ] Admin area under `/dashboard/admin/*` (countries/series/subjects/users + overview)
- [x] [ ] Content management under `/dashboard/content/*` (courses/exams/quiz + filters)
- [x] [ ] Upload endpoint `/api/upload` (image uploads + role checks)

---

## Stage 1 — MVP (launchable, coherent, end-to-end)

### 1) Documentation & local setup (unblock shipping)
- [x] [ ] Replace root `README.md` with Afribac docs (run, env vars, Supabase setup, migrations, seed)
- [x] [ ] Add `docs/LOCAL_SETUP.md` (Supabase project + required env vars + basic troubleshooting)
- [x] [ ] Add `docs/DEPLOYMENT.md` (Vercel env vars + Supabase prod checklist)

### 2) Make the app surface coherent (remove duplicate “old” flows)
- [x] [ ] Choose canonical surfaces: keep `/dashboard` as the entry for all roles
- [x] [ ] Redirect legacy dashboards:
  - [x] [ ] `/student/dashboard` → `/dashboard` (keep `/student/*` feature pages for now)
  - [x] [ ] `/member/*` → `/dashboard`
  - [x] [ ] `/admin/*` → `/dashboard`
- [x] [ ] Remove console logs in auth/dashboards (`use-auth`, legacy dashboards) and standardize redirects

### 3) Fix missing / stubbed API routes
- [ ] [ ] Decide: implement or delete `app/api/extract-pdf/` (currently directory without route)
- [ ] [ ] Decide: implement or delete `app/api/admin/users/` (currently directory without route)

### 4) Student core loop (must work end-to-end)
- [ ] [ ] Course detail page (open a course, show content + PDF/video if present)
- [ ] [ ] PDF viewing experience is smooth (loading, error states, mobile)
- [ ] [ ] Progress updates:
  - [ ] [ ] create/update `user_progress` on open/leave/complete
  - [ ] [ ] track time spent + last accessed
- [ ] [ ] Student library experience:
  - [ ] [ ] browse courses (filtered by country/series via RLS)
  - [ ] [ ] browse exams

### 5) Member core loop (create → publish → students consume)
- [ ] [ ] Course editor “happy path” works:
  - [ ] [ ] create/edit content
  - [ ] [ ] upload course materials to `course-materials` bucket (PDF)
  - [ ] [ ] publish/unpublish (status changes)
- [ ] [ ] Exam creation “happy path” works (questions/correction PDFs or rich content)
- [ ] [ ] Quiz/exercise creation “happy path” works (questions + options)

### 6) Quiz & exam attempts (student assessment)
- [ ] [ ] Quiz taking flow:
  - [ ] [ ] start attempt → answer → submit → score → store in `quiz_attempts` + `user_answers`
- [ ] [ ] Exam simulation attempts:
  - [ ] [ ] start attempt → autosave answers → submit → store in `exam_attempts`
- [ ] [ ] Results screen (at least score + corrections access)

### 7) Admin operations (minimum for real operations)
- [ ] [ ] Replace “manual” admin setup with documented steps (create admin user, seed)
- [ ] [ ] Add minimal activity logging coverage for key actions (create/edit/publish/delete)

### 8) MVP deployment readiness
- [ ] [ ] Verify RLS with 3 test users (admin/member/user) across 2 countries
- [ ] [ ] Error monitoring (basic) + production env var checklist
- [ ] [ ] Smoke test script/checklist (signup → onboarding → dashboard → consume content)

---

## Stage 2 — Full Version (scale + differentiation)

### A) “Unique Afribac” learning features
- [ ] [ ] Adaptive revision planner (based on series + weak topics + exam date)
- [ ] [ ] Mastery map per subject/topic (strength/weakness visualization)
- [ ] [ ] Spaced repetition queue for missed quiz questions (daily review)

### B) Africa-first distribution & accessibility
- [ ] [ ] Low-bandwidth mode (lite pages, aggressive caching, PDF-first)
- [ ] [ ] Offline support for saved lessons/quizzes (where feasible)
- [ ] [ ] WhatsApp/SMS companion (reminders + micro-quizzes)

### C) Content quality & trust at scale
- [ ] [ ] Editorial workflow (draft → review → publish) + reviewer assignment
- [ ] [ ] Contributor reputation + impact dashboard (students helped, completions)
- [ ] [ ] Content quality signals (ratings, completion, difficulty calibration)

### D) Analytics that drive outcomes
- [ ] [ ] Student insights: topic mastery, time distribution, improvement trends
- [ ] [ ] Member insights: content impact per cohort/series/country
- [ ] [ ] Admin insights: cross-country comparisons, growth funnels, retention

### E) Community & engagement
- [ ] [ ] Discussions/Q&A per course/topic (moderation + anti-spam)
- [ ] [ ] Study groups per country/series + weekly challenges
- [ ] [ ] Notifications (in-app + email), preferences

### F) Monetization (if desired)
- [ ] [ ] Subscription plans (free/paid) + entitlements
- [ ] [ ] Paywalls by feature/content category

