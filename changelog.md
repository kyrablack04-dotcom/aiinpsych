# Changelog

All notable changes to this project are documented in this file.

Format: date + category + concise impact statement + touched artifacts.

## [2026-03-17]

### Added
- Brainstorm TODO list containing five proposed product features.
  - Artifacts: [TODO.md](TODO.md)

- Feature 3 planning document for note tagging.
  - Artifacts: [Feature3Plan.md](Feature3Plan.md)

- Tags feature across backend and frontend:
  - Backend: normalized tags model, note-tags association, tag CRUD/filter support
  - Frontend: tags input, tag chips, click-to-filter, inline edit tags
  - Artifacts:
    - [backend/models.py](backend/models.py)
    - [backend/main.py](backend/main.py)
    - [frontend/index.html](frontend/index.html)
    - [frontend/app.js](frontend/app.js)
    - [frontend/styles.css](frontend/styles.css)

- AI summary feature slice (in progress):
  - Backend summary persistence model and API endpoints
  - AI summary generation service with fallback path
  - Frontend summary render and generate/regenerate action
  - Artifacts:
    - [backend/ai_service.py](backend/ai_service.py)
    - [backend/models.py](backend/models.py)
    - [backend/main.py](backend/main.py)
    - [frontend/app.js](frontend/app.js)
    - [frontend/styles.css](frontend/styles.css)

### Verified
- Database schema includes `note_tags`, `tags`, and `note_summaries` tables.
- API routes include `/notes/{note_id}/summary` endpoints.
- No diagnostics errors in the modified files during the latest checks.

### Notes
- Summary generation currently supports provider-backed output when configured and a local fallback when provider access is unavailable.
- Further enhancements should be logged here with date-stamped entries and grouped by Added/Changed/Fixed/Removed.

### TODO Status Snapshot
- Smart AI Note Summaries: In progress
- Mood and Severity Tracking: Not started
- Reminder and Follow-Up Scheduler: Not started
- Secure Collaboration and Sharing: Not started
- Insight Dashboard with Tag Analytics: Not started

### Changed
- Added commit policy enforcement for status tracking: each commit must update and stage `TODO.md` and `changelog.md`.
  - Artifacts:
    - [.githooks/pre-commit](.githooks/pre-commit)
    - [agent.md](agent.md)

- Completed Smart AI Note Summaries implementation with end-to-end metadata display.
  - Backend now exposes summary model metadata on note responses.
  - Summary generation uses a stricter structured prompt and richer fallback summary sections.
  - Frontend now displays generated timestamp and model source together.
  - Artifacts:
    - [backend/models.py](backend/models.py)
    - [backend/main.py](backend/main.py)
    - [backend/ai_service.py](backend/ai_service.py)
    - [frontend/app.js](frontend/app.js)

- Reviewed feature priorities and documented the next independent item.
  - Confirmed Mood and Severity Tracking as the next highest-priority item that does not depend on reminder-specific views.
  - Artifacts:
    - [TODO.md](TODO.md)
    - [worklog.md](worklog.md)

- Softened commit logging enforcement so reminders remain in place without blocking commits.
  - The hook now warns when `TODO.md` or `changelog.md` are not staged, but allows the commit to proceed.
  - Documentation now treats TODO/changelog updates as required when status changes rather than on every commit.
  - Artifacts:
    - [.githooks/pre-commit](.githooks/pre-commit)
    - [agent.md](agent.md)

### TODO Status Snapshot
- Smart AI Note Summaries: Done
- Mood and Severity Tracking: Not started
- Reminder and Follow-Up Scheduler: Not started
- Secure Collaboration and Sharing: Not started
- Insight Dashboard with Tag Analytics: Not started