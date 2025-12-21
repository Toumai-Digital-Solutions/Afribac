# Course Detail Layout - UX Spec

Goal: present course content in structured blocks with clear progress, resources (PDF/video), and study actions.

## Primary user story
As a student, I can read the course, track my progress, switch to PDF/video resources, and resume later.

## Layout overview
- Hero header:
  - Course title, subject, topic, difficulty, estimated duration.
  - Progress badge and "Mark as completed" action.
- Content area:
  - Tabs: Content, PDF, Video.
  - Content uses structured blocks with readable spacing.
- Sidebar (desktop):
  - Progress summary.
  - Quick outline (headings).
  - Next actions (practice quiz, simulation).
  - Related tags.

## Content structure (blocks)
Recommended block types:
- Heading (H1-H4)
- Paragraph
- Callout (tip, warning, recap)
- Definition
- Example
- Exercise prompt
- Formula / math
- Image with caption
- Table
- Summary / key takeaways

## Content rendering sources
- Preferred: `courses.content_json` (PlateJS value) for rich blocks.
- Fallback: `courses.content` (HTML) sanitized before render.
- PDF: `courses.pdf_url`
- Video: `courses.video_url`

## Interactions
- Progress updates on scroll (content tab).
- Bookmark PDF pages.
- "Mark completed" sets completion to 100%.
- Resume last position on return (optional).

## Empty and edge states
- No content text: show placeholder + suggest PDF.
- No PDF: disable PDF tab.
- No video: disable Video tab.
- Slow network: show skeleton loaders and allow PDF open in new tab.

## Accessibility
- Tabs keyboard navigable.
- PDF viewer controls reachable by keyboard.
- High-contrast badges and focus rings.

## Implementation notes (Next.js + Supabase)
- Use `PlateContentRenderer` for `content_json` when present.
- Keep current HTML rendering as fallback.
- Store progress in `user_progress` (completion, time_spent, bookmarks).

## Open questions
- Should the outline be generated from headings or stored explicitly?
- Do we need inline quizzes inside content blocks?
