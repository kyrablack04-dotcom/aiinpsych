## Plan: Keyword Note Search

Add keyword-based note search by introducing a small search UI in the frontend and note-query support in the backend. The recommended approach is to search both title and content through a backend endpoint, because the current app already defines a persisted Note model but does not yet expose note APIs; this keeps the feature aligned with stored notes instead of a temporary client-only filter.

**Steps**
1. Phase 1: Align the notes flow before search. Define the frontend note container and input structure that the search bar will sit alongside, because the current HTML and JavaScript are not wired to the same DOM ids. This step blocks search UI work.
2. Phase 1: Add or formalize note API primitives in `/workspaces/aiinpsych/backend/main.py` so the app has a consistent way to fetch notes before adding search-specific behavior. This includes database session access and response shapes. This step blocks backend search.
3. Phase 2: Add a backend note search endpoint in `/workspaces/aiinpsych/backend/main.py` that accepts a keyword query and matches against both `Note.title` and `Note.content` from `/workspaces/aiinpsych/backend/models.py`. Use simple case-insensitive partial matching appropriate for SQLite-backed SQLAlchemy queries.
4. Phase 2: Define empty-query behavior and response semantics. Recommended behavior: an empty search returns all notes, while a non-empty query returns filtered results; this keeps the search bar usable as the main note-browsing entry point.
5. Phase 3: Add a search input and trigger control to `/workspaces/aiinpsych/frontend/index.html`, placing it in the same top-level note-controls area as note creation so the page has one consistent interaction zone. This depends on steps 1 and 2.
6. Phase 3: Update `/workspaces/aiinpsych/frontend/app.js` so search input changes or submit actions call the backend search endpoint, render the returned notes into the note list, and handle no-results and request-failure states. This depends on steps 3 through 5.
7. Phase 3: Update `/workspaces/aiinpsych/frontend/styles.css` to style the search bar consistently with the existing `.add-note` pattern and ensure the controls remain usable on narrow screens. This can run in parallel with step 6 once the HTML structure is decided.
8. Phase 4: Add lightweight UX rules for search feedback, including preserving the current query in the input, showing a clear empty-state message when no notes match, and avoiding duplicate rendering logic between initial load and search results.
9. Phase 4: Verify that initial note loading, populated searches, empty-result searches, and empty-query resets all work against the same rendering path.

**Relevant files**
- `/workspaces/aiinpsych/backend/main.py` - add note retrieval foundation, database session dependency, and the search endpoint; reuse the existing FastAPI app and CORS setup.
- `/workspaces/aiinpsych/backend/models.py` - reuse the Note model fields `title` and `content` as the searchable columns.
- `/workspaces/aiinpsych/backend/database.py` - reuse `SessionLocal` and engine setup for backend query access if session wiring is added.
- `/workspaces/aiinpsych/frontend/index.html` - add the visible search controls and align actual DOM ids/classes with what the JavaScript expects.
- `/workspaces/aiinpsych/frontend/app.js` - centralize note fetching/rendering and add keyword-search request handling.
- `/workspaces/aiinpsych/frontend/styles.css` - reuse and extend the existing `.add-note` control styling for the search UI.
- `/workspaces/aiinpsych/Feature1Plan.md` - use as a formatting/content precedent for a top-level feature plan file if the plan is later copied into the workspace.

**Verification**
1. Start the FastAPI backend and confirm the new note-list and note-search routes return expected JSON for both matching and non-matching keywords.
2. Load the frontend and verify that entering a keyword filters notes by both title and content.
3. Verify that clearing the search restores the full note list without requiring a page refresh.
4. Verify that the UI handles no matches with a clear message rather than an empty broken layout.
5. Verify that search controls remain usable and readable on desktop and mobile widths.

**Decisions**
- Included: planning for a search bar and keyword-based note retrieval across persisted notes.
- Recommended assumption: search matches both title and content.
- Recommended assumption: search is backend-driven rather than purely client-side, because the repository already has a persisted Note model and no complete frontend-only notes architecture.
- Excluded: full note CRUD implementation details beyond what is necessary to support retrieval/search.
- Excluded: advanced ranking, fuzzy matching, stemming, highlighting, or SQLite FTS; use basic partial-match search first.

**Further Considerations**
1. Trigger style: live search on input offers faster UX, but submit-button search is simpler and easier to reason about for an initial version.
2. Performance: basic `LIKE` queries are appropriate for this project size; if note volume grows, revisit indexing or full-text search.
3. UX boundary: if note creation remains partially static/client-only, reconcile that architecture before implementing search so users do not search a different dataset than the one shown on screen.