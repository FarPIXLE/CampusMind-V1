// journal-tool.js - Digital Journal functionality

const JournalTool = {
    editor: null,
    wordCountDisplay: null,
    entries: [],
    entriesList: null,
    entriesSection: null,
    promptDisplay: null,
    prompts: [
        "What are three things you're grateful for today?",
        "Describe a moment today that made you smile.",
        "Is there something you'd like to let go of?",
        "What's one thing you're looking forward to?",
        "How are you showing self-care this week?",
        "List one new thing you want to try.",
        "What's a challenge you overcame recently?",
        "How are you feeling right now?"
    ],
    currentPrompt: 0,

    init() {
        this.editor = document.getElementById('journal-textarea');
        this.wordCountDisplay = document.getElementById('word-count');
        this.entriesList = document.getElementById('entries-list');
        this.entriesSection = document.getElementById('journal-entries');
        this.promptDisplay = document.getElementById('daily-prompt');
        this.loadEntries();
        this.bindEvents();
        this.setPrompt(0);
    },

    bindEvents() {
        if (this.editor) {
            this.editor.addEventListener('input', this.updateWordCount.bind(this));
        }
        
        // Save Entry
        const saveBtn = document.querySelector('.journal-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveEntry());
        }

        // View Entries
        const viewBtn = document.querySelector('.journal-btn.secondary');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => this.showEntries());
        }

        // New Prompt
        const promptBtn = document.querySelector('.prompt-btn');
        if (promptBtn) {
            promptBtn.addEventListener('click', () => this.getNewPrompt());
        }
    },

    setPrompt(idx) {
        this.currentPrompt = idx;
        if (this.promptDisplay) {
            this.promptDisplay.textContent = this.prompts[idx % this.prompts.length];
        }
    },

    getNewPrompt() {
        this.currentPrompt = (this.currentPrompt + 1) % this.prompts.length;
        this.setPrompt(this.currentPrompt);
    },

    saveEntry() {
        const text = this.editor.value.trim();
        if (!text) {
            this.showNotification('Please enter your journal entry first!', 'warning');
            return;
        }
        const entry = {
            id: Date.now(),
            text,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            prompt: this.promptDisplay ? this.promptDisplay.textContent : ''
        };
        this.entries.push(entry);
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        this.editor.value = '';
        this.updateWordCount();
        this.showNotification('Journal entry saved!', 'success');
        this.showEntries();
    },

    loadEntries() {
        try {
            const stored = localStorage.getItem('journalEntries');
            this.entries = stored ? JSON.parse(stored) : [];
        } catch (error) {
            this.entries = [];
        }
    },

    showEntries() {
        if (!this.entriesSection || !this.entriesList) return;
        this.entriesSection.style.display = 'block';
        this.entriesList.innerHTML = '';

        if (this.entries.length === 0) {
            this.entriesList.innerHTML = '<p class="no-entries">No entries yet. Start writing to see your thoughts here!</p>';
            return;
        }

        this.entries.slice().reverse().forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'journal-entry';
            entryDiv.innerHTML = `
                <div class="entry-date"><strong>${entry.date}</strong> ${entry.time}</div>
                <div class="entry-prompt">${entry.prompt}</div>
                <div class="entry-text">${entry.text}</div>
            `;
            this.entriesList.appendChild(entryDiv);
        });
    },

    updateWordCount() {
        if (!this.editor || !this.wordCountDisplay) return;
        const words = this.editor.value.trim() ? this.editor.value.trim().split(/\s+/).length : 0;
        this.wordCountDisplay.textContent = `${words} words`;
    },

    showNotification(message, type = 'info', duration = 3500) {
        // Remove any current notification
        const existing = document.querySelectorAll('.journal-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `journal-notification ${type}`;
        notification.textContent = message;
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            zIndex: 10000,
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
        });
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, duration);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', JournalTool.init.bind(JournalTool));
} else {
    JournalTool.init();
}

window.JournalTool = JournalTool;
