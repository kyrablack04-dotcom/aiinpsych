# Agent Guide

Purpose: define how implementation work is planned, executed, and logged in this repository.

## Core Workflow
1. Read requirements fully before coding.
2. Prefer small, testable increments.
3. Implement backend and frontend in coherent slices.
4. Validate each slice with quick smoke checks.
5. Log every meaningful change in both worklog and changelog.

## Planning Standard
- Capture feature intent before coding.
- Document API contract changes (request/response fields, endpoints).
- Identify validation criteria before implementation.
- Keep scope explicit: what is included and excluded.

## Logging Rules
- Update `worklog.md` for all meaningful work products:
  - brainstorming
  - planning
  - implementation
  - verification
  - refactors and fixes
- Update `changelog.md` for notable user-facing or architectural changes using:
  - Added
  - Changed
  - Fixed
  - Removed
- Commit logging policy:
  - When a commit changes tracked work progress, update `TODO.md` status for affected items.
  - When a commit changes tracked work progress, append or refresh the `TODO Status Snapshot` in `changelog.md`.
  - Stage `TODO.md` and `changelog.md` whenever the commit changes feature status, priorities, or milestone completion.
  - A pre-commit hook provides advisory reminders, but it does not block commits.
- Every log entry should include:
  - date/time (UTC)
  - objective
  - files/artifacts touched
  - verification evidence
  - follow-up actions

## Coding Conventions
- Keep API behavior predictable and backward-compatible when possible.
- Normalize and validate user input on write paths.
- Use clear naming for endpoints and models.
- Prefer readable code over clever code.
- Add concise comments only where logic is not obvious.

## Verification Checklist
- Backend imports and route registration succeed.
- Database schema updates create expected tables/columns.
- Frontend interactions execute without console/runtime errors.
- Diagnostics/lint checks pass for changed files.
- New feature behavior is manually smoke-tested end-to-end.

## Feature Delivery Template
When implementing a new feature, follow this order:
1. Data model updates (if needed)
2. API endpoints + business logic
3. Frontend UI and event wiring
4. Styling and UX polish
5. Validation and logging updates

## Current Priority Context
See `TODO.md` for active feature priorities. Start with top unchecked item unless directed otherwise.

## TODO Snapshot Format (expected when status changes)
- `TODO.md`: mark each touched item as one of:
  - `Not started`
  - `In progress`
  - `Blocked`
  - `Done`
- `changelog.md`: append a dated snapshot, for example:
  - `### TODO Status Snapshot`
  - `- Smart AI Note Summaries: In progress`
  - `- Mood and Severity Tracking: Not started`