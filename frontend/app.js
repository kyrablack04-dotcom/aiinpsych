const API_BASE_URL = 'http://127.0.0.1:8000';

const createNoteForm = document.getElementById('create-note-form');
const titleInput = document.getElementById('note-title-input');
const contentInput = document.getElementById('note-content-input');
const tagsInput = document.getElementById('note-tags-input');
const createNoteButton = document.getElementById('create-note-button');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchButton = document.getElementById('clear-search-button');
const notesContainer = document.getElementById('notes-container');
const statusMessage = document.getElementById('status-message');
const activeTagFilterEl = document.getElementById('active-tag-filter');
const activeTagNameEl = document.getElementById('active-tag-name');
const clearTagFilterButton = document.getElementById('clear-tag-filter');

let activeTagFilter = null;

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? '#b33f2e' : '#4d5b63';
}

function renderTagChips(tags) {
    if (!tags || !tags.length) {
        return '';
    }

    const chips = tags
        .map((tag) => `<span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`)
        .join('');
    return `<div class="note-tags">${chips}</div>`;
}

function renderNotes(notes, query = '') {
    if (!notes.length) {
        const emptyMessage = query
            ? `No notes matched "${escapeHtml(query)}".`
            : activeTagFilter
                ? `No notes found with tag "${escapeHtml(activeTagFilter)}".`
                : 'No notes yet. Create your first note above.';

        notesContainer.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    notesContainer.innerHTML = notes
        .map((note) => {
            const title = escapeHtml(note.title);
            const content = escapeHtml(note.content);
            const updatedAt = formatDate(note.updated_at);
            const tagChips = renderTagChips(note.tags);
            const summary = note.summary ? escapeHtml(note.summary) : '';
            const summaryUpdatedAt = note.summary_updated_at ? formatDate(note.summary_updated_at) : '';
            const summaryModel = note.summary_model ? escapeHtml(note.summary_model) : 'unknown-model';
            const summaryBlock = note.summary
                ? `<section class="note-summary"><p class="note-summary-label">AI summary</p><p class="note-summary-content">${summary}</p><p class="note-summary-meta">Generated ${summaryUpdatedAt} via ${summaryModel}</p></section>`
                : '';
            const summaryButtonLabel = note.summary ? 'Regenerate summary' : 'Generate summary';

            return `
                <article class="note" data-note-id="${note.id}">
                    <div class="note-header">
                        <div>
                            <h3 class="note-title">${title}</h3>
                            <p class="note-meta">Updated ${updatedAt}</p>
                        </div>
                    </div>
                    <p class="note-content">${content}</p>
                    ${tagChips}
                    ${summaryBlock}
                    <div class="note-actions">
                        <button type="button" class="summary-button" data-note-id="${note.id}">${summaryButtonLabel}</button>
                        <button type="button" class="edit-tags-button secondary-button" data-note-id="${note.id}" data-tags="${escapeHtml(JSON.stringify(note.tags || []))}">Edit tags</button>
                        <button type="button" class="delete-button" data-note-id="${note.id}">Delete</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

async function fetchNotes(query = '', tag = null) {
    let endpoint;
    if (query) {
        endpoint = `${API_BASE_URL}/notes/search?q=${encodeURIComponent(query)}`;
        if (tag) {
            endpoint += `&tag=${encodeURIComponent(tag)}`;
        }
    } else {
        endpoint = `${API_BASE_URL}/notes`;
        if (tag) {
            endpoint += `?tag=${encodeURIComponent(tag)}`;
        }
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error('Unable to load notes.');
    }

    return response.json();
}

async function loadNotes(query = '') {
    const trimmedQuery = query.trim();
    setStatus(trimmedQuery ? `Searching for "${trimmedQuery}"...` : 'Loading notes...');

    try {
        const notes = await fetchNotes(trimmedQuery, activeTagFilter);
        renderNotes(notes, trimmedQuery);

        if (trimmedQuery) {
            setStatus(`Showing ${notes.length} result${notes.length === 1 ? '' : 's'} for "${trimmedQuery}".`);
            return;
        }

        setStatus(`Loaded ${notes.length} note${notes.length === 1 ? '' : 's'}.`);
    } catch (error) {
        notesContainer.innerHTML = '<div class="empty-state">Unable to load notes. Make sure the backend is running.</div>';
        setStatus(error.message, true);
    }
}

async function createNote(title, content, tags = []) {
    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags }),
    });

    if (!response.ok) {
        throw new Error('Unable to save the note.');
    }

    return response.json();
}

async function updateNoteTags(noteId, tags) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/tags`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
        throw new Error('Unable to update tags.');
    }

    return response.json();
}

async function deleteNote(noteId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Unable to delete the note.');
    }
}

async function generateSummary(noteId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/summary`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Unable to generate summary.');
    }

    return response.json();
}

function filterByTag(tag) {
    activeTagFilter = tag;
    activeTagFilterEl.classList.add('visible');
    activeTagNameEl.textContent = tag;
    loadNotes(searchInput.value);
}

function clearTagFilter() {
    activeTagFilter = null;
    activeTagFilterEl.classList.remove('visible');
    activeTagNameEl.textContent = '';
    loadNotes(searchInput.value);
}

function editNoteTags(noteId, currentTags) {
    const noteEl = notesContainer.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteEl) {
        return;
    }

    const existingTagsEl = noteEl.querySelector('.note-tags');
    const actionsEl = noteEl.querySelector('.note-actions');
    const editButton = actionsEl.querySelector('.edit-tags-button');

    const inlineEdit = document.createElement('div');
    inlineEdit.className = 'note-tags-edit';
    inlineEdit.innerHTML = `
        <input type="text" class="tags-edit-input" value="${escapeHtml(currentTags.join(', '))}" placeholder="e.g. anxiety, CBT">
        <button type="button" class="save-tags-button">Save</button>
        <button type="button" class="cancel-tags-button secondary-button">Cancel</button>
    `;

    if (existingTagsEl) {
        existingTagsEl.replaceWith(inlineEdit);
    } else {
        actionsEl.insertAdjacentElement('beforebegin', inlineEdit);
    }

    editButton.disabled = true;
    inlineEdit.querySelector('.tags-edit-input').focus();

    inlineEdit.querySelector('.cancel-tags-button').addEventListener('click', () => {
        if (existingTagsEl) {
            inlineEdit.replaceWith(existingTagsEl);
        } else {
            inlineEdit.remove();
        }
        editButton.disabled = false;
    });

    inlineEdit.querySelector('.save-tags-button').addEventListener('click', async () => {
        const inputValue = inlineEdit.querySelector('.tags-edit-input').value;
        const newTags = inputValue.split(',').map((tag) => tag.trim()).filter(Boolean);
        const saveButton = inlineEdit.querySelector('.save-tags-button');
        saveButton.disabled = true;
        setStatus('Saving tags...');

        try {
            await updateNoteTags(noteId, newTags);
            await loadNotes(searchInput.value);
            setStatus('Tags updated.');
        } catch (error) {
            saveButton.disabled = false;
            setStatus(error.message, true);
        }
    });
}

createNoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tags = tagsInput.value.split(',').map((tag) => tag.trim()).filter(Boolean);

    if (!title || !content) {
        setStatus('Title and content are required.', true);
        return;
    }

    createNoteButton.disabled = true;
    setStatus('Saving note...');

    try {
        await createNote(title, content, tags);
        createNoteForm.reset();
        await loadNotes(searchInput.value);
        setStatus('Note saved successfully.');
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        createNoteButton.disabled = false;
    }
});

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await loadNotes(searchInput.value);
});

clearSearchButton.addEventListener('click', async () => {
    searchInput.value = '';
    await loadNotes('');
});

clearTagFilterButton.addEventListener('click', clearTagFilter);

notesContainer.addEventListener('click', async (event) => {
    const summaryButton = event.target.closest('.summary-button');
    if (summaryButton) {
        const noteId = summaryButton.dataset.noteId;
        if (!noteId) {
            return;
        }

        summaryButton.disabled = true;
        setStatus('Generating summary...');

        try {
            await generateSummary(noteId);
            await loadNotes(searchInput.value);
            setStatus('Summary generated.');
        } catch (error) {
            summaryButton.disabled = false;
            setStatus(error.message, true);
        }
        return;
    }

    const deleteButton = event.target.closest('.delete-button');
    if (deleteButton) {
        const noteId = deleteButton.dataset.noteId;
        if (!noteId) {
            return;
        }

        deleteButton.disabled = true;
        setStatus('Deleting note...');

        try {
            await deleteNote(noteId);
            await loadNotes(searchInput.value);
            setStatus('Note deleted successfully.');
        } catch (error) {
            deleteButton.disabled = false;
            setStatus(error.message, true);
        }
        return;
    }

    const editTagsButton = event.target.closest('.edit-tags-button');
    if (editTagsButton) {
        const noteId = editTagsButton.dataset.noteId;
        const currentTags = JSON.parse(editTagsButton.dataset.tags || '[]');
        editNoteTags(noteId, currentTags);
        return;
    }

    const tagChip = event.target.closest('.tag');
    if (tagChip) {
        filterByTag(tagChip.dataset.tag);
    }
});

loadNotes();