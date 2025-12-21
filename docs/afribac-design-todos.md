---
name: afribac-design-todos
description: Design system + full feature UX specs with gamification and TODO backlog
---

# Plan

Define and document a complete UI/UX design system and screen-level specs for all features in `general.md`, aligned with the current codebase and role-based flows, then produce a prioritized TODO backlog for implementation. Add a full gamification layer (points, badges, streaks, levels, rewards, leaderboards, challenges).

## Requirements
- Cover student, member, and admin experiences plus advanced features (planner, community, AI, monetization, mobile/offline, analytics).
- Produce actionable TODOs per feature (UI, data, API, content ops).
- Include a full gamification framework: points, badges, streaks, levels, rewards, challenges, leaderboards.
- Keep designs consistent with existing Next.js + Tailwind + shadcn/ui patterns unless you want a full visual redesign.

## Scope
- In: Information architecture, design system, page templates, feature UX specs, and a TODO backlog.
- Out: Backend implementation, data migrations, and production rollout (captured only as TODOs).

## Files and entry points
- App surfaces: `app/page.tsx`, `app/dashboard/*`, `app/student/*`, `app/member/*`, `app/admin/*`, `app/auth/*`
- Design components: `components/ui/*`, `components/dashboards/*`, `components/educational/*`, `components/forms/*`
- Docs (for specs): `docs/` (new `docs/design/` or similar if you want a design spec repo-side)

## Data model / API changes
- Community: `threads`, `posts`, `comments`, `reactions`, `groups`, `group_members`
- Learning planner: `study_plans`, `plan_items`, `revision_queue`, `mastery_scores`
- Analytics: `events`, `skill_metrics`, `cohorts`
- Monetization: `plans`, `subscriptions`, `entitlements`, `payments`
- Notifications: `notifications`, `notification_preferences`, `push_tokens`
- AI features: `ai_sessions`, `ai_feedback`, `plagiarism_checks`
- Gamification: `points_ledger`, `badges`, `user_badges`, `levels`, `user_levels`, `streaks`, `challenges`, `challenge_participants`, `leaderboards`

## Action items
[ ] Inventory all features from `general.md` + current code; map to personas and journeys.  
[ ] Define the global IA and navigation model (canonical routes; resolve `/dashboard` vs `/student`/`/member`).  
[ ] Draft the design system (type scale, color tokens, spacing, components, states, empty/error).  
[ ] Produce UX specs for core flows: auth/onboarding, course discovery, course detail, quiz, exam simulation, progress.  
[ ] Produce UX specs for creator flows: course/quiz/exam creation, review workflow, asset management.  
[ ] Produce UX specs for admin flows: content oversight, users, analytics, moderation.  
[ ] Design advanced modules: revision planner, spaced repetition, mastery map, badges/gamification.  
[ ] Gamification UX spec: points rules, badge taxonomy, streak mechanics, levels, rewards store, challenges, and leaderboards (student + class + school).  
[ ] Gamification surfaces: student dashboard widgets, profile “trophies” page, course/quiz end-state rewards, admin badge management, member “impact” badges.  
[ ] Design community + mentorship modules: forums, study groups, tutor flow, live sessions.  
[ ] Design monetization + access control: pricing page, paywall, upgrade, subscription management.  
[ ] Design mobile/offline + notifications UX (PWA, low-bandwidth, push/SMS).  
[ ] Compile a feature-by-feature TODO backlog with UI + data/API dependencies and priority.  

## Testing and validation
- Design reviews against goals (Africa-first + low-bandwidth).
- UX walkthroughs per role; accessibility checklist; responsive layouts.
- Prototype test with 3–5 students and 1–2 teachers.

## Risks and edge cases
- Scope explosion across advanced features; needs phased delivery.
- Missing schema for community/monetization could block UI later.
- Inconsistent route surfaces causing UX confusion.
- Offline mode complexity and content size constraints.
- Gamification risks: point inflation, “cheating”, and demotivating low performers.

## Open questions
- Do you want a full visual redesign or to keep current visual language?
- Should the design specs live in `docs/design/` or be external (Figma only)?
