// JavaScript functionality for a simple Notes App

// Function to create a new note
function createNote() {
    const noteInput = document.getElementById('note-input');
    const notesContainer = document.getElementById('notes-container');
    const noteText = noteInput.value;

    if (!noteText) {
        alert('Please enter a note.');
        return;
    }

    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.textContent = noteText;

    notesContainer.appendChild(noteElement);
    noteInput.value = '';
}

// Event listener for the create note button
const createNoteButton = document.getElementById('create-note-button');
createNoteButton.addEventListener('click', createNote);