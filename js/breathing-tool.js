// Guided breathing with a private, local session history.
const BreathingTool = {
    running: false,
    currentTechnique: null,
    cycles: 0,
    elapsedSeconds: 0,
    timer: null,
    stepTimer: null,
    sequenceIndex: 0,
    sessionStartedAt: null,
    guide: null,
    circle: null,
    controls: null,
    timerDisplay: null,
    cyclesDisplay: null,
    history: [],
    sequences: {
        '478': { label: '4-7-8 breathing', steps: [{ action: 'Inhale', time: 4 }, { action: 'Hold', time: 7 }, { action: 'Exhale', time: 8 }] },
        box: { label: 'Box breathing', steps: [{ action: 'Inhale', time: 4 }, { action: 'Hold', time: 4 }, { action: 'Exhale', time: 4 }, { action: 'Hold', time: 4 }] },
        deep: { label: 'Easy breathing', steps: [{ action: 'Inhale', time: 4 }, { action: 'Exhale', time: 6 }] }
    },

    init() {
        this.guide = document.getElementById('breathing-guide');
        this.circle = document.getElementById('breathing-circle');
        this.controls = document.getElementById('breathing-controls');
        this.timerDisplay = document.getElementById('breathing-timer');
        this.cyclesDisplay = document.getElementById('breathing-cycles');
        try { this.history = JSON.parse(localStorage.getItem('breathingSessions') || '[]'); } catch (_) { this.history = []; }
        this.renderHistory();
        this.setControls(false);
    },

    start478() { this.startSession('478'); },
    startBoxBreathing() { this.startSession('box'); },
    startDeepBreathing() { this.startSession('deep'); },

    startSession(technique) {
        if (!this.sequences[technique]) return;
        this.clearTimers();
        this.currentTechnique = technique;
        this.running = true;
        this.cycles = 0;
        this.elapsedSeconds = 0;
        this.sequenceIndex = 0;
        this.sessionStartedAt = new Date();
        this.setControls(true);
        this.timer = setInterval(() => {
            this.elapsedSeconds += 1;
            this.updateTimer();
        }, 1000);
        this.runStep();
    },

    runStep() {
        if (!this.running) return;
        const sequence = this.sequences[this.currentTechnique].steps;
        const step = sequence[this.sequenceIndex];
        const phase = step.action.toLowerCase();
        if (this.guide) this.guide.textContent = `${step.action} · ${step.time} seconds`;
        if (this.circle) {
            this.circle.style.background = ({ inhale: '#6F9B8C', hold: '#B99A6A', exhale: '#6F8795' })[phase];
            this.circle.style.transition = `transform ${step.time}s ease-in-out`;
            this.circle.style.transform = phase === 'inhale' ? 'scale(1.16)' : phase === 'exhale' ? 'scale(.9)' : 'scale(1.16)';
        }
        if (this.timerDisplay) this.timerDisplay.textContent = `0:${String(step.time).padStart(2, '0')}`;
        this.stepTimer = setTimeout(() => {
            if (!this.running) return;
            this.sequenceIndex += 1;
            if (this.sequenceIndex >= sequence.length) {
                this.cycles += 1;
                this.sequenceIndex = 0;
                this.updateCycle();
            }
            this.runStep();
        }, step.time * 1000);
    },

    pause() {
        if (!this.running) return;
        this.running = false;
        this.clearTimers();
        if (this.guide) this.guide.textContent = 'Paused. Resume when you feel ready.';
        if (this.circle) this.circle.style.transition = 'transform .2s ease';
        const pauseBtn = document.getElementById('breathing-pause-btn');
        if (pauseBtn) pauseBtn.textContent = 'Resume';
    },

    resume() {
        if (this.running || !this.currentTechnique) return;
        this.running = true;
        this.timer = setInterval(() => { this.elapsedSeconds += 1; this.updateTimer(); }, 1000);
        const pauseBtn = document.getElementById('breathing-pause-btn');
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        this.runStep();
    },

    togglePause() { this.running ? this.pause() : this.resume(); },

    stop() {
        const shouldSave = this.currentTechnique && this.elapsedSeconds > 0;
        if (shouldSave) this.saveSession();
        this.clearTimers();
        this.running = false;
        this.currentTechnique = null;
        if (this.guide && !shouldSave) this.guide.textContent = 'Ready when you are. Follow a comfortable pace; stop if you feel dizzy.';
        if (this.circle) {
            this.circle.style.transition = 'transform .2s ease';
            this.circle.style.transform = 'scale(1)';
            this.circle.style.background = '';
        }
        if (this.timerDisplay) this.timerDisplay.textContent = '0:00';
        this.cycles = 0;
        this.elapsedSeconds = 0;
        this.updateCycle();
        this.setControls(false);
    },

    clearTimers() {
        clearInterval(this.timer);
        clearTimeout(this.stepTimer);
        this.timer = this.stepTimer = null;
    },

    setControls(active) {
        if (this.controls) this.controls.style.display = active ? 'flex' : 'none';
        document.querySelectorAll('.technique-btn').forEach(button => { button.disabled = active; });
    },

    updateTimer() {
        if (this.timerDisplay) this.timerDisplay.textContent = `${Math.floor(this.elapsedSeconds / 60)}:${String(this.elapsedSeconds % 60).padStart(2, '0')}`;
    },

    updateCycle() { if (this.cyclesDisplay) this.cyclesDisplay.textContent = `${this.cycles} ${this.cycles === 1 ? 'cycle' : 'cycles'}`; },

    saveSession() {
        const session = {
            id: Date.now(),
            technique: this.sequences[this.currentTechnique].label,
            cycles: this.cycles,
            durationSeconds: this.elapsedSeconds,
            timestamp: this.sessionStartedAt ? this.sessionStartedAt.toISOString() : new Date().toISOString()
        };
        this.history.unshift(session);
        this.history = this.history.slice(0, 100);
        try {
            localStorage.setItem('breathingSessions', JSON.stringify(this.history));
            if (this.guide) this.guide.textContent = `Session saved · ${session.cycles} ${session.cycles === 1 ? 'cycle' : 'cycles'} · ${session.durationSeconds}s`;
        } catch (_) {
            if (this.guide) this.guide.textContent = 'Could not save this session on this device. You can still use the breathing guide.';
        }
        this.renderHistory();
    },

    renderHistory() {
        const container = document.getElementById('breathing-history');
        if (!container) return;
        if (!this.history.length) { container.textContent = 'Completed sessions will appear here on this device.'; return; }
        container.replaceChildren();
        this.history.slice(0, 5).forEach(item => {
            const row = document.createElement('p');
            const date = new Date(item.timestamp);
            row.textContent = `${date.toLocaleDateString()} · ${item.technique} · ${item.cycles} ${item.cycles === 1 ? 'cycle' : 'cycles'} · ${Math.floor(item.durationSeconds / 60)}m ${item.durationSeconds % 60}s`;
            container.appendChild(row);
        });
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => BreathingTool.init());
else BreathingTool.init();
window.BreathingTool = BreathingTool;
