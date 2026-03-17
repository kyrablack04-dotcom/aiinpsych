## Plan: Tags for Notes

Add a tag system that lets users categorize notes, discover related content by clicking a tag, and update tags on existing notes at any time. Tags are stored in a normalized relational model so filtering stays efficient as the note count grows. Comma-separated text input keeps the creation flow fast; inline editing on the note card avoids navigating away; and clickable tag chips on each card allow one-click browsing by topic.

**Steps**
1. Phase 1: Add a `note_tags` association table and a `Tag` ORM model in `backend/models.py`. Add a `tags` many-to-many relationship on `Note` using `secondary=note_tags`. No migration is needed because SQLAlchemy's `create_all()` will create the new tables on startup without touching the existing `notes` table.
2. Phase 2: Add a `NoteTagsUpdate` Pydantic model and extend `NoteCreate` with a `tags: list[str] = []` field in `backend/main.py`. Update `NoteResponse` with a `tags: list[str] = []` field and a Pydantic `field_validator(mode='before')` that converts ORM `Tag` objects to their `.name` strings, matching the `from_attributes=True` config that is already on the model.
3. Phase 2: Add a `get_or_create_tag()` helper that looks up a `Tag` by normalized name (stripped, lowercased) and creates one if it does not exist. Update `POST /notes` to call this helper for each tag in the request and set `new_note.tags` accordingly.
4. Phase 2: Add a `PATCH /notes/{note_id}/tags` endpoint that replaces a note's tags with a new list supplied by the caller. Return the updated `NoteResponse`. Return 404 if the note does not exist.
5. Phase 2: Update `query_notes()` to accept an optional `tag` parameter and, when present, join on the `Note.tags` relationship and filter by `Tag.name`. Update `GET /notes` and `GET /notes/search` to accept `tag` as a query parameter and forward it to `query_notes()`, so keyword search and tag filter can be combined in a single request.
6. Phase 2: Add a `GET /tags` endpoint that returns all distinct tag names sorted alphabetically as a `list[str]`. This step is independent of steps 3 through 5.
7. Phase 3: Add a Tags input to the create-note form in `frontend/index.html` (below the content textarea) with a comma-separated placeholder. Add an `#active-tag-filter` banner near the search bar that is hidden by default and reveals itself when a tag filter is active.
8. Phase 3: Update `createNote()` in `frontend/app.js` to parse the tags input (split by comma, trim, filter empty strings) and include the array in the POST body. Clear the tags input on successful save.
9. Phase 3: Update `renderNotes()` in `frontend/app.js` to render a `.note-tags` container with `.tag` chip spans beneath each note's content, each chip carrying a `data-tag` attribute. Add an "Edit tags" button to the note actions row alongside the existing delete button.
10. Phase 3: Update `fetchNotes()` to accept a `tag` parameter and append it to the URL (`?tag=` or `&tag=` depending on whether a keyword query is also present). Update `loadNotes()` to pass the active tag filter. Add a module-level `activeTagFilter` variable, a `filterByTag()` function that sets it and triggers a reload, and a `clearTagFilter()` function that resets it. Wire `.tag` chip clicks and the clear-filter button via event delegation on `#notes-container`.
11. Phase 4: Add an `editNoteTags()` function that replaces the `.note-tags` div on a specific note card with an inline input pre-filled with the current tags (comma-separated), plus Save and Cancel buttons. Add a `saveNoteTags()` function that parses the input and sends a `PATCH /notes/{id}/tags` request, then reloads the list on success. Wire the "Edit tags" button click via the existing event delegation on `#notes-container`.
12. Phase 4: Update `frontend/styles.css` with styles for `.note-tags` (flex, wrap, gap), `.tag` chips (pill shape, teal palette colours, pointer cursor, hover lift), `.note-tags-edit` (inline flex container), `.tags-edit-input` (flex growth override), and the `.active-tag-filter` banner (`display: none` default with a `.visible` modifier class toggled by JavaScript).

**Relevant files**
- `backend/models.py` — add `note_tags` Association Table, `Tag` ORM model, and `tags` relationship on `Note`.
- `backend/main.py` — add `NoteTagsUpdate`, extend `NoteCreate` and `NoteResponse`, add `get_or_create_tag()`, update `query_notes()`, update `POST /notes`, add `PATCH /notes/{note_id}/tags`, update `GET /notes` and `GET /notes/search` with tag query param, add `GET /tags`.
- `frontend/index.html` — add tags input to the create form; add the `#active-tag-filter` banner.
- `frontend/app.js` — update `createNote()`, `renderNotes()`, `fetchNotes()`, and `loadNotes()`; add `renderTagChips()`, `updateNoteTags()`, `filterByTag()`, `clearTagFilter()`, and `editNoteTags()`; extend the `notesContainer` click handler.
- `frontend/styles.css` — add tag chip styles, active filter banner styles, inline tag edit styles, and a gap to `.note-actions`.

**Verification**
1. Restart the FastAPI backend and confirm no startup errors; verify that `tags` and `note_tags` tables are created in `database.db`.
2. `POST /notes` with `{"title": "Test", "content": "Body", "tags": ["Anxiety", " CBT "]}` returns `{"tags": ["anxiety", "cbt"], ...}` confirming normalization.
3. `GET /notes` returns all notes; pre-existing notes have `"tags": []`.
4. `GET /notes?tag=anxiety` returns only notes tagged "anxiety".
5. `GET /notes/search?q=test&tag=cbt` intersects keyword and tag filtering.
6. `PATCH /notes/{id}/tags` with `{"tags": ["depression"]}` returns the note with `"tags": ["depression"]`.
7. `GET /tags` returns a sorted list of all distinct tag names.
8. UI — Create a note with tags: chips render on the note card.
9. UI — Click a chip: notes filter and the active-filter banner appears; click × clears the filter.
10. UI — Click "Edit tags": inline input appears pre-filled; update and save; tags update without page refresh.

**Decisions**
- Tags are normalized on write (stripped whitespace, lowercased) to keep matching consistent and avoid duplicate tags that differ only in case or surrounding spaces.
- Tags are stored in a dedicated `Tag` table (not as a text column on `Note`) so that filtering with a JOIN stays efficient as data grows, and so that `GET /tags` can return the full tag vocabulary cheaply.
- Tag input uses a comma-separated plain text field rather than chip-based interactive input to keep the creation form simple and keyboard-friendly.
- Tag filtering is handled server-side so the result count updates correctly even when notes are paginated or searched simultaneously.
- Orphaned tags (tags no longer associated with any note) are left in the database; a cleanup pass is out of scope for this feature.
- The active tag filter and keyword search are additive: both can be active at the same time.