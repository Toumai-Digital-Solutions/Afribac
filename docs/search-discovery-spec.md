# Search and Discovery Filters (Student) - UX Spec

Goal: help students find the right course quickly using country/series context plus subject, topic, and tags.

## Primary user story
As a student, I can search by keyword and filter by subject, topic, or tag to find relevant courses for my series.

## Entry point
- Student library or courses list (currently `/student/courses`).

## Layout
- Top bar:
  - Search input with placeholder "Search courses, topics, or tags".
  - Sort dropdown (Recommended, Newest, Most popular, Difficulty).
- Filter row (desktop):
  - Country (pre-selected to profile; locked unless multi-country is allowed).
  - Series (pre-selected to profile; locked unless user changes series).
  - Subject (single-select).
  - Topic (single-select; dependent on subject when chosen).
  - Tags (multi-select, searchable).
- Filter drawer (mobile):
  - All filters inside a sheet/drawer with apply/reset actions.

## Filters and behavior
- Country and series:
  - Default to profile values.
  - If multiple values are allowed in the future, enable selection.
- Subject:
  - Single-select, optional.
  - Resets topic when changed.
- Topic:
  - Single-select, optional.
  - If no subject selected, show all topics with subject label.
- Tags:
  - Multi-select.
  - OR match (any selected tag) for broader discovery.
- Search:
  - Search across title, description, and tag names.
  - Debounced in UI, applied via URL query params.
- Sort:
  - Default to "Recommended" (can be mapped to updated_at or popularity).

## Query parameters
- `search`: string
- `country_id`: uuid (default from profile)
- `series_id`: uuid (default from profile)
- `subject_id`: uuid
- `topic_id`: uuid
- `tag_id`: uuid (repeatable) or `tag_ids` (comma list)
- `sort`: `recommended` | `newest` | `popular` | `difficulty`

## Empty and edge states
- No results: show guidance and reset filters CTA.
- Missing content for country/series: show "Content coming soon" state.
- Low bandwidth: use compact cards and delayed image loading.

## Result card content
- Title, subject, topic, difficulty badge.
- Short description snippet.
- Estimated duration.
- Progress badge (if started).
- Tags (max 3 with "+N more").

## Implementation notes (Next.js + Supabase)
- Use `searchable_courses` view.
- Filter by:
  - `contains('country_ids', [country_id])`
  - `contains('series_ids', [series_id])`
  - `eq('subject_id', subject_id)`
  - `eq('topic_id', topic_id)`
  - `contains('tag_ids', [tag_id])`
- Search:
  - `or('title.ilike.%q%,description.ilike.%q%')`
- Sort:
  - `updated_at` for newest.
  - `view_count` for popular (if available).

## Open questions
- Should students be allowed to browse outside their series?
- Do we want AND or OR for multiple tag selections?
