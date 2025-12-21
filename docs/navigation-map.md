# Afribac Navigation Map (Draft)

Defines canonical routes and global navigation for each role. This is a working draft meant to resolve route duplication and enable consistent menus.

## Canonical app surfaces (proposal)
- Public: `/`
- Auth: `/auth/*`
- Onboarding: `/auth/onboarding/*`
- Student: `/dashboard` (role: user)
- Member: `/dashboard` (role: member)
- Admin: `/dashboard/admin`

## Legacy routes and redirect plan
- `/student/*` -> `/dashboard` + route-level redirects to canonical equivalents.
- `/member/*` -> `/dashboard` + route-level redirects to canonical equivalents.
- `/admin/*` -> `/dashboard/admin` (if kept, redirect).

## Global navigation map

### Public
- Landing: `/`
- Pricing: `/pricing` (new)
- About: `/about` (optional)
- Contact: `/contact` (optional)

### Auth
- Sign in: `/auth/signin`
- Sign up: `/auth/signup`
- Reset password: `/auth/reset-password`
- Email sent: `/auth/email-sent`
- Callback: `/auth/callback`
- Onboarding: `/auth/onboarding/name`, `/auth/onboarding/location`

### Student (role: user)
- Dashboard: `/dashboard`
- Library (courses): `/student/courses` (candidate: `/dashboard/library?tab=courses`)
- Library (exams): `/student/exams` (candidate: `/dashboard/library?tab=exams`)
- Quiz and practice: `/student/quiz` (candidate: `/dashboard/practice`)
- Simulation: `/student/simulation` (candidate: `/dashboard/simulation`)
- Progress: `/student/progress` (candidate: `/dashboard/progress`)
- Planner: `/student/planner` (new)
- Mastery map: `/student/mastery` (new)
- Review queue: `/student/review` (new)
- Notes/flashcards: `/student/notes` (new)
- Community: `/community` (new)
- Profile: `/dashboard/profile`

### Member (role: member)
- Dashboard: `/dashboard`
- Courses: `/dashboard/content/courses`
- Quiz and exercises: `/dashboard/content/quiz`
- Exams: `/dashboard/content/exams`
- Review workflow: `/dashboard/content/review` (new)
- Assets: `/dashboard/gallery`
- Analytics: `/dashboard/analytics` (new)
- Community: `/community` (moderation)
- Profile: `/dashboard/profile`

### Admin (role: admin)
- Overview: `/dashboard/admin`
- Users: `/dashboard/admin/users`
- Countries: `/dashboard/admin/countries`
- Series: `/dashboard/admin/series`
- Subjects: `/dashboard/admin/subjects`
- Activity: `/dashboard/admin/activity`
- Settings: `/dashboard/settings`

## Mobile navigation (proposal)
- Student bottom nav: Dashboard, Library, Practice, Planner, Profile
- Member bottom nav: Dashboard, Content, Review, Analytics, Profile

## Open decisions
- Should `/student/*` and `/member/*` stay as thin wrappers or be removed later?
- Should library and practice live under `/dashboard/*` or stay as `/student/*`?
- Do we keep `/admin/*` routes or redirect all to `/dashboard/admin`?
