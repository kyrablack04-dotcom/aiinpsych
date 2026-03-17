const API_BASE_URL = 'http://127.0.0.1:8000';

const createNoteForm = document.getElementById('create-note-form');
const titleInput = document.getElementById('note-title-input');
const contentInput = document.getElementById('note-content-input');
const createNoteButton = document.getElementById('create-note-button');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const clearSearchButton = document.getElementById('clear-search-button');
const notesContainer = document.getElementById('notes-container');
const statusMessage = document.getElementById('status-message');

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

function renderNotes(notes, query = '') {
    if (!notes.length) {
        const emptyMessage = query
            ? `No notes matched "${escapeHtml(query)}".`
            : 'No notes yet. Create your first note above.';

        notesContainer.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    notesContainer.innerHTML = notes
        .map((note) => {
            const title = escapeHtml(note.title);
            const content = escapeHtml(note.content);
            const updatedAt = formatDate(note.updated_at);

            return `
                <article class="note" data-note-id="${note.id}">
                    <div class="note-header">
                        <div>
                            <h3 class="note-title">${title}</h3>
                            <p class="note-meta">Updated ${updatedAt}</p>
                        </div>
                    </div>
                    <p class="note-content">${content}</p>
                    <div class="note-actions">
                        <button type="button" class="delete-button" data-note-id="${note.id}">Delete</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

async function fetchNotes(query = '') {
    const endpoint = query
        ? `${API_BASE_URL}/notes/search?q=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/notes`;

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
        const notes = await fetchNotes(trimmedQuery);
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

async function createNote(title, content) {
    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
        throw new Error('Unable to save the note.');
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

createNoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        setStatus('Title and content are required.', true);
        return;
    }

    createNoteButton.disabled = true;
    setStatus('Saving note...');

    try {
        await createNote(title, content);
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

notesContainer.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('.delete-button');
    if (!deleteButton) {
        return;
    }

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
});

loadNotes();