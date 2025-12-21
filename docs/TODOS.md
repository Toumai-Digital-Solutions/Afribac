# Afribac TODOs

Single, prioritized backlog covering design specs, product features, and implementation notes.

Legend: [P0] Now, [P1] Next, [P2] Later

## Strategy and IA
- [x] [P0] Decide canonical app surface for each role (student/member/admin) and redirect legacy routes.
- [x] [P0] Define global navigation map (primary, secondary, account, onboarding exits).
- [x] [P1] Document user journeys for student, member, admin.
- [x] [P1] Create a phased delivery roadmap aligned with exam calendar by country.


## Auth and Onboarding
- [ ] [P0] Audit onboarding flow for missing profile data and reduce drop-off.
- [ ] [P0] Add onboarding step for study goals and weekly availability.
- [ ] [P1] Add optional parent/mentor invite flow.
- [ ] [P1] Add profile completion checklist with progress indicator.

## Student Core Experience
- [x] [P0] Improve search and discovery filters (country, series, subject, topic, tags).
- [x] [P0] Build course detail layout with structured content blocks (text, PDF, video).
- [x] [P0] Implement progress tracking UX on course pages (time, completion, bookmarks).
- [x] [P0] Finalize quiz player UX and result summary (score, review, retry).
- [x] [P0] Finalize exam simulation UX with autosave, timer, and submission state.
- [x] [P1] Add student library page (saved, in-progress, completed).
- [x] [P1] Add daily study plan view with checklist and time blocks.
- [x] [P1] Add mastery map per subject/topic.
- [x] [P1] Add spaced repetition review queue for missed questions.
- [x] [P2] Add study notes and personal flashcards per topic.

## Gamification (Badges, Points, Levels)
- [ ] [P0] Define points rules (course completion, quiz score, streaks, challenges).
- [ ] [P0] Define badge taxonomy (progress, mastery, consistency, community).
- [ ] [P0] Design streak system rules (daily, weekly, recovery).
- [ ] [P0] Design student-facing trophies page with filters and progress states.
- [ ] [P0] Add reward feedback on quiz/course completion (points, badges, streak).
- [ ] [P1] Add levels and level-up rewards (cosmetics or perks).
- [ ] [P1] Build challenges system (weekly, class-based, school-based).
- [ ] [P1] Build leaderboards with privacy controls (class/school/country).
- [ ] [P1] Add reward store or perk unlocks (optional).
- [ ] [P2] Anti-cheat rules and abuse detection for point inflation.

## Analytics and Student Insights
- [ ] [P0] Define core learning metrics (time, completion, accuracy, mastery).
- [ ] [P1] Build student analytics dashboard with trends and gaps.
- [ ] [P1] Add score prediction per subject based on attempts and progress.
- [ ] [P2] Add cohort comparisons (class or country averages).

## Member (Teacher/Contributor) Experience
- [ ] [P0] Define content creation flow for courses, quizzes, and exams.
- [ ] [P0] Build rich editor UX with preview, validation, and media management.
- [ ] [P0] Implement content status workflow (draft, review, publish).
- [ ] [P1] Add collaborative review checklist with audit trail.
- [ ] [P1] Add content quality scoring (views, completion, feedback).
- [ ] [P2] Add contributor reputation and impact badges.

## Admin Experience
- [ ] [P0] Add user status management (active, suspended, deleted) UI and audit logs.
- [ ] [P0] Add moderation queue for reports and flagged content.
- [ ] [P1] Add country and series management UX improvements.
- [ ] [P1] Add platform-wide analytics dashboards (engagement, retention).
- [ ] [P2] Add role-based permissions editor and approval workflows.

## Community and Collaboration
- [ ] [P1] Build forum/Q&A structure (subjects, topics, tags).
- [ ] [P1] Add study groups (creation, invites, membership).
- [ ] [P1] Add peer-to-peer tutoring flow (request, match, schedule).
- [ ] [P2] Add live sessions/webinars with replays.
- [ ] [P2] Add messaging and notifications for group activity.

## AI Features
- [ ] [P1] Add student AI tutor (contextual help, explain solutions).
- [ ] [P1] Add AI study plan assistant (suggest daily tasks).
- [ ] [P1] Add AI content tools for members (question generation, summaries).
- [ ] [P2] Add plagiarism checks for assignments.
- [ ] [P2] Add speech or voice features for language learning.

## Mobile and Low-Bandwidth
- [ ] [P1] Add PWA install flow and offline caching strategy.
- [ ] [P1] Add low-bandwidth mode (lite pages, reduced media).
- [ ] [P1] Add download manager for PDFs and key lessons.
- [ ] [P2] Add push notifications (reminders, streaks, challenges).
- [ ] [P2] Add SMS/WhatsApp reminders for critical events.

## Monetization and Access Control
- [ ] [P1] Define free vs premium entitlements.
- [ ] [P1] Add pricing page and upgrade flow.
- [ ] [P1] Integrate billing provider (Stripe or local alternatives).
- [ ] [P2] Add scholarships and sponsored access.
- [ ] [P2] Add marketplace flow for paid courses and revenue share.

## Platform and Data
- [ ] [P0] Implement missing API routes and remove dead stubs.
- [ ] [P0] Review RLS policies for new tables and role boundaries.
- [ ] [P1] Add event tracking system (analytics events table or PostHog).
- [ ] [P1] Add activity logging for content actions (create/edit/publish/delete).
- [ ] [P2] Add audit trail for admin actions.

## QA and Reliability
- [ ] [P0] Add smoke tests for critical routes and auth flows.
- [ ] [P1] Add end-to-end tests for student quiz and exam simulations.
- [ ] [P1] Add load testing plan for exam peak times.
- [ ] [P2] Add automated visual regression checks for key pages.

## Documentation
- [ ] [P0] Update README with clear project overview and local setup.
- [ ] [P0] Add design spec location and contribution guidelines.
- [ ] [P1] Add data model diagrams and API contracts.
- [ ] [P1] Add editorial guidelines for content quality and formatting.
