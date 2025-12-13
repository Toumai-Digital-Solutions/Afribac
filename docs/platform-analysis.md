# Afribac — Platform Analysis (Codebase Review)

Last updated: 2025-12-13

## What I understood you’re building (product intent)

Afribac is an educational platform focused on **African baccalauréat preparation**, with:

- **Students** learning from structured content (courses, exams, quizzes/exercises), tracking progress, and running exam simulations.
- **Collaborators/Teachers (members)** creating and maintaining content for their **country** (and potentially collaborating with other members).
- **Admins** managing global configuration (countries, series, subjects), users, and system-wide oversight.

The platform is designed to be **country-aware**, **series-aware**, and **role-aware**, with data access restricted via **Supabase RLS policies**.

## High-level architecture (as implemented)

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS + Radix UI components.
- **Auth / DB / Storage**: Supabase (auth, Postgres, storage), with SSR helpers (`@supabase/ssr`) and middleware session refresh.
- **Security model**:
  - **Next.js middleware** gates protected routes (`/dashboard`, `/admin`, `/member`, `/student`) to authenticated users.
  - **Supabase RLS** enforces data visibility and write permissions per role + country.

## Roles & access model (as implemented)

Roles are stored on `profiles.role` with a hierarchy:

- **admin**: global access & management.
- **member**: content contributor with scoped access (typically their own country).
- **user**: student (consumes published content; limited write actions like progress and attempts).

There are helper guards in code (`requireRole`, `requireCountryAccess`, `requireAuth`) and RLS policies implement the real enforcement in the database.

## Data model overview (as implemented in migrations)

The schema is already “platform-grade” (not just MVP tables):

- **Catalog & curriculum**: `countries`, `series`, `subjects`, `series_subjects` (with coefficients)
- **Content**:
  - Courses: `courses`, `course_series`, `course_tags`, plus a `topics` taxonomy
  - Exams: `exams`, `exam_tags`, `exam_attempts`
  - Quiz/Exercises: `quiz_exercises`, `questions`, `answer_options`, `quiz_attempts`, `user_answers`, `quiz_exercise_tags`
- **Student tracking**: `user_progress`
- **Admin/ops**: `activity_logs` (+ `activity_log_details` view)
- **Storage**:
  - `avatars` bucket with folder-based policies
  - `course-materials` bucket
  - `gallery-assets` bucket + `gallery_assets` table (image/latex)
- **Views** for richer queries: `course_details`, `searchable_courses`, `exam_details`, `quiz_exercise_details`, `searchable_quiz_exercises`, etc.

## What looks “fully done” vs “partial” vs “missing”

### Fully done (end-to-end, conceptually complete)

- **Authentication plumbing**
  - Email/password + OAuth sign-in scaffolding is present.
  - Session refresh middleware is implemented.
  - Auth callback route exchanges code for session.
- **Role-aware routing**
  - `/dashboard` resolves the user’s `profiles` record and shows role-specific dashboard experience.
  - Onboarding gates are enforced (missing `full_name`, `country_id`, `series_id`).
- **Core database design + RLS**
  - RLS policies cover most tables and encode your “country + role” access rules.
  - Profile creation trigger on `auth.users` insertion is implemented.
- **Admin “configuration”**
  - You have substantial UI for managing the global reference data (countries, series, subjects) and users under `/dashboard/admin/*`.
- **Content management foundation**
  - `/dashboard/content/*` exists with server-side data loading and filtering (courses/exams/quiz).
  - Courses list uses `searchable_courses` view and supports filters (country/series/subject/topic/status/search).
- **Upload endpoint**
  - `POST /api/upload` supports authenticated uploads (images) with role checks for uploading on behalf of another user.

### Partially done (some pieces exist, but it’s not fully “product complete”)

- **Student experience**
  - The “StudentDashboard” component (used by `/dashboard` for role `user`) is rich and data-backed.
  - The `/student/*` routes exist but some appear to be older/placeholder variants (e.g. `/student/dashboard` uses a simpler hook-based UI and hard-coded stats).
- **Member experience**
  - There is a detailed “MemberDashboard” component (used by `/dashboard` for role `member`) that reads member-created content.
  - The `/member/*` routes exist and look like a parallel/older flow; it’s not clear which is the canonical entrypoint long-term (`/dashboard` vs `/member/dashboard`).
- **Activity logging**
  - DB table exists and there’s a client helper to insert logs, but it’s not obvious (from a quick scan) that you’re logging key actions everywhere yet (create/edit/publish/delete).
- **Collaboration**
  - There is collaboration-oriented logic (fetch collaborators, “collaborative courses”), but it currently relies on shared visibility via RLS rather than explicit review/workflow or real-time editing.
- **Storage & assets**
  - Buckets and policies exist (avatars, course materials, gallery assets), but the “content authoring” UX for managing these assets will determine if it feels complete.

### Missing / broken / incomplete (based on repo scan)

- **API routes that are stub directories**
  - `app/api/extract-pdf/` exists but has no `route.ts` implementation.
  - `app/api/admin/users/` exists but has no `route.ts` (only an empty `test/` directory).
- **Project documentation**
  - Root `README.md` currently contains **Supabase CLI documentation**, which does not describe Afribac.
  - There is no clear “how to run locally” doc (env vars, Supabase setup, migration workflow, seed data, etc.) in the root docs.
- **Analytics/engagement features**
  - Dashboards display some “analytics-like” UI, but true learning analytics (retention, mastery, cohorts, funnel) doesn’t appear fully implemented end-to-end yet.
- **Monetization/subscriptions**
  - No obvious billing/subscription features are present in code and schema.
- **Community / messaging**
  - Landing page mentions community-like features, but there’s no implemented forum/chat/Q&A layer in schema/routes.

## Notable product/technical observations (important)

- **You already did the hard part**: RLS policies encode the real business rules (role + country + published/draft).
- **You have duplicate route “surfaces”** (`/dashboard/*` and `/student/*`, `/member/*`), which will create confusion unless one becomes canonical and the other is deprecated.
- **Your schema supports much more than current UI** (quiz attempt tracking, exam attempts, tag taxonomy, topics). This is a good sign: you can unlock value quickly by wiring UI to it.

## Nice-to-have features that would make Afribac feel unique

### Learning experience / pedagogy (high leverage)

- **Adaptive revision planner (per series/country)**: build a “smart schedule” using `topics`, `difficulty_level`, `user_progress`, and recent quiz/exam attempts.
- **Mastery map per subject/topic**: show students where they are strong/weak, and generate next recommended resources automatically.
- **Spaced repetition for quiz questions**: turn missed questions into a daily “review queue”.

### Africa-first differentiation (unique positioning)

- **Low-bandwidth mode**: “lite” pages, PDF-first experience, optional offline caching of lessons/quizzes.
- **WhatsApp/SMS companion**: reminders, mini-quizzes, and notifications (especially for regions where messaging apps dominate).
- **Country curriculum comparison**: “same topic, different countries” view (your data model already supports cross-country content with `course_series` + `countries`).

### Content operations (quality & scale)

- **Review workflow for content** (draft → review → published) with reviewer assignment, checklists, and audit trail using `activity_logs`.
- **Content quality scoring**: combine usage (views), completion rates, and student feedback to rank/flag content.
- **Contributor reputation**: badges for members, visible impact metrics (students helped, completion improvements).

### Exam simulation (sticky feature)

- **Timed simulation with auto-save + attempt history**: your `exam_attempts` table is ready; wire the UI to it.
- **Correction modes**: self-correction, guided correction, and “common mistakes” overlays per question.

## Suggested next steps (practical roadmap)

### 1) Make the surface area coherent

- Pick one canonical app surface for each role:
  - Students: `/dashboard` (recommended) and make `/student/*` either redirect or become a thin wrapper.
  - Members: `/dashboard` (recommended) and decide whether `/member/*` stays.

### 2) Fill the “missing API” gaps

- Implement `app/api/extract-pdf/route.ts` or remove the directory if it’s no longer planned.
- Implement `app/api/admin/users/route.ts` (or remove) and keep user management through Supabase queries/RLS if that’s the chosen approach.

### 3) Wire up the “already-modeled” features

- Student quiz attempt flow (create attempt → submit answers → compute score → store).
- Exam simulation attempts (start → save answers → submit → results).
- Progress updates (start/continue course, time spent, completion%).

### 4) Add product “moat” features

- Adaptive revision planner + mastery map.
- Low-bandwidth/offline support.
- Review workflow for content quality and trust.

## Appendix: Known docs gap

Your root `README.md` appears to be from another project (Supabase CLI) and does not document Afribac. That will slow onboarding for contributors and future you.


