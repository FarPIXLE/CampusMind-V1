// Private reflection journal. Entries and drafts stay in this browser.
const JournalTool = {
    editor: null,
    wordCountDisplay: null,
    charCountDisplay: null,
    entries: [],
    entriesList: null,
    entriesSection: null,
    promptDisplay: null,
    prompts: [
        'What are three things you appreciate today?',
        'Describe a moment today that made you smile.',
        'Is there something you would like to set down for now?',
        'What is one thing you are looking forward to?',
        'How have you cared for yourself this week?',
        'What is one small step that would make tomorrow easier?',
        'What helped you through a recent challenge?',
        'What do you notice in yourself right now?'
    ],
    currentPrompt: 0,

    init() {
        this.editor = document.getElementById('journal-textarea');
        this.wordCountDisplay = document.getElementById('word-count');
        this.charCountDisplay = document.getElementById('char-count');
        this.entriesList = document.getElementById('entries-list');
        this.entriesSection = document.getElementById('journal-entries');
        this.promptDisplay = document.getElementById('daily-prompt');
        this.loadEntries();
        if (!this.editor) return;
        try { this.editor.value = localStorage.getItem('journalDraft') || ''; } catch (_) { /* storage may be disabled */ }
        this.editor.addEventListener('input', () => {
            this.updateWordCount();
            try { localStorage.setItem('journalDraft', this.editor.value); } catch (_) { /* keep editing in memory */ }
        });
        this.updateWordCount();
        this.setPrompt(0);
    },

    setPrompt(index) {
        this.currentPrompt = index;
        if (this.promptDisplay) this.promptDisplay.textContent = this.prompts[index % this.prompts.length];
    },
    getNewPrompt() { this.setPrompt((this.currentPrompt + 1) % this.prompts.length); },

    saveEntry() {
        if (!this.editor) return;
        const text = this.editor.value.trim();
        if (!text) return this.showNotification('Write a little before saving your entry.', 'warning');
        const entry = {
            id: Date.now(), text,
            timestamp: new Date().toISOString(),
            prompt: this.promptDisplay ? this.promptDisplay.textContent : ''
        };
        this.entries.unshift(entry);
        try {
            localStorage.setItem('journalEntries', JSON.stringify(this.entries));
            localStorage.removeItem('journalDraft');
        } catch (_) {
            this.entries.shift();
            return this.showNotification('This device could not save the entry. Check browser storage settings and try again.', 'error');
        }
        this.editor.value = '';
        this.updateWordCount();
        this.showNotification('Entry saved on this device.', 'success');
        this.showEntries();
    },

    loadEntries() {
        try {
            const stored = JSON.parse(localStorage.getItem('journalEntries') || '[]');
            this.entries = Array.isArray(stored) ? stored : [];
        } catch (_) { this.entries = []; }
    },

    viewPastEntries() { this.showEntries(); },
    showEntries() {
        if (!this.entriesSection || !this.entriesList) return;
        this.entriesSection.hidden = false;
        this.entriesSection.style.display = 'block';
        this.entriesList.replaceChildren();
        if (!this.entries.length) {
            const empty = document.createElement('p');
            empty.className = 'no-entries';
            empty.textContent = 'No entries yet. Your private reflections will appear here.';
            this.entriesList.appendChild(empty);
            return;
        }
        this.entries.forEach(entry => {
            const card = document.createElement('article');
            card.className = 'journal-entry';
            const date = new Date(entry.timestamp || entry.id);
            const heading = document.createElement('div');
            heading.className = 'entry-date';
            heading.textContent = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const prompt = document.createElement('div');
            prompt.className = 'entry-prompt';
            prompt.textContent = entry.prompt || '';
            const body = document.createElement('p');
            body.className = 'entry-text';
            body.textContent = entry.text || '';
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'journal-delete-btn';
            remove.textContent = 'Delete entry';
            remove.addEventListener('click', () => this.deleteEntry(entry.id));
            card.append(heading, prompt, body, remove);
            this.entriesList.appendChild(card);
        });
    },

    deleteEntry(id) {
        this.entries = this.entries.filter(entry => entry.id !== id);
        try { localStorage.setItem('journalEntries', JSON.stringify(this.entries)); }
        catch (_) { return this.showNotification('Could not update browser storage.', 'error'); }
        this.showEntries();
    },

    exportEntries() {
        const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), entries: this.entries }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campusmind-journal-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },

    updateWordCount() {
        if (!this.editor) return;
        const text = this.editor.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        if (this.wordCountDisplay) this.wordCountDisplay.textContent = `${words} words`;
        if (this.charCountDisplay) this.charCountDisplay.textContent = `${this.editor.value.length} characters`;
    },

    showNotification(message, type = 'info', duration = 3500) {
        document.querySelectorAll('.journal-notification').forEach(node => node.remove());
        const notice = document.createElement('div');
        notice.className = `journal-notification ${type}`;
        notice.setAttribute('role', 'status');
        notice.textContent = message;
        Object.assign(notice.style, {
            position: 'fixed', bottom: '30px', right: '30px', backgroundColor: type === 'success' ? '#527A68' : type === 'error' ? '#944940' : '#527A74',
            color: 'white', padding: '12px 20px', borderRadius: '10px', zIndex: 10000, fontWeight: '500', boxShadow: '0 10px 25px rgba(0,0,0,.12)'
        });
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), duration);
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => JournalTool.init());
else JournalTool.init();
window.JournalTool = JournalTool;
