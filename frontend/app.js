// JavaScript functionality for a simple Notes App

const BACKEND_URL = 'http://localhost:8000';

// Function to create a new note
function createNote() {
    const titleInput = document.getElementById('note-title');
    const noteInput = document.getElementById('note-input');
    const notesContainer = document.getElementById('notes-container');

    const noteTitle = titleInput.value.trim();
    const noteText = noteInput.value.trim();

    if (!noteText) {
        alert('Please enter note content.');
        return;
    }

    const noteElement = document.createElement('div');
    noteElement.classList.add('note');

    const titleElement = document.createElement('h3');
    titleElement.textContent = noteTitle || 'Untitled';

    const contentElement = document.createElement('p');
    contentElement.classList.add('note-content');
    contentElement.textContent = noteText;

    const summaryElement = document.createElement('p');
    summaryElement.classList.add('note-summary');
    summaryElement.style.display = 'none';

    const buttonRow = document.createElement('div');
    buttonRow.classList.add('note-actions');

    // Feature 1: Delete note
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => {
        notesContainer.removeChild(noteElement);
    });

    // Feature 2: AI Summarize
    const summarizeButton = document.createElement('button');
    summarizeButton.textContent = 'Summarize';
    summarizeButton.classList.add('summarize-btn');
    summarizeButton.addEventListener('click', () => {
        summarizeButton.disabled = true;
        summarizeButton.textContent = 'Summarizing…';
        fetch(`${BACKEND_URL}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: noteText }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Summarization failed.');
                return res.json();
            })
            .then((data) => {
                summaryElement.textContent = `Summary: ${data.summary}`;
                summaryElement.style.display = 'block';
            })
            .catch(() => {
                summaryElement.textContent = 'Could not generate summary. Please try again.';
                summaryElement.style.display = 'block';
            })
            .finally(() => {
                summarizeButton.disabled = false;
                summarizeButton.textContent = 'Summarize';
            });
    });

    buttonRow.appendChild(summarizeButton);
    buttonRow.appendChild(deleteButton);

    noteElement.appendChild(titleElement);
    noteElement.appendChild(contentElement);
    noteElement.appendChild(summaryElement);
    noteElement.appendChild(buttonRow);

    notesContainer.appendChild(noteElement);

    titleInput.value = '';
    noteInput.value = '';
}

// Event listener for the create note button
const createNoteButton = document.getElementById('create-note-button');
createNoteButton.addEventListener('click', createNote);