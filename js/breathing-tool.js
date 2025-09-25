// breathing-tool.js - Breathing Exercises functionality

const BreathingTool = {
    // State
    running: false,
    currentTechnique: null,
    cycles: 0,
    timer: null,
    guide: null,
    circle: null,
    controls: null,
    timerDisplay: null,
    cyclesDisplay: null,

    init() {
        this.guide = document.getElementById('breathing-guide');
        this.circle = document.getElementById('breathing-circle');
        this.controls = document.getElementById('breathing-controls');
        this.timerDisplay = document.getElementById('breathing-timer');
        this.cyclesDisplay = document.getElementById('breathing-cycles');
    },

    start478() {
        this.startSession('478');
    },

    startBoxBreathing() {
        this.startSession('box');
    },

    startDeepBreathing() {
        this.startSession('deep');
    },

    startSession(technique) {
        this.running = true;
        this.currentTechnique = technique;
        this.cycles = 1;
        
        if (this.controls) this.controls.style.display = 'block';
        this.updateGuide('Get ready...');
        this.updateCycle();
        this.runTechnique();
    },

    runTechnique() {
        if (!this.running) return;
        let sequence = [];
        let label = '';
        let colors = {
            inhale: '#10B981',
            hold: '#F59E0B',
            exhale: '#3B82F6'
        };

        switch (this.currentTechnique) {
            case '478':
                sequence = [
                    {action: 'inhale', time: 4},
                    {action: 'hold', time: 7},
                    {action: 'exhale', time: 8}
                ];
                label = '4-7-8 Technique';
                break;
            case 'box':
                sequence = [
                    {action: 'inhale', time: 4},
                    {action: 'hold', time: 4},
                    {action: 'exhale', time: 4},
                    {action: 'hold', time: 4}
                ];
                label = 'Box Breathing';
                break;
            case 'deep':
                sequence = [
                    {action: 'inhale', time: 5},
                    {action: 'exhale', time: 5}
                ];
                label = 'Deep Breathing';
                break;
            default:
                sequence = [];
        }

        this.playSequence(sequence, 0, () => {
            if (!this.running) return;
            this.cycles++;
            this.updateCycle();
            this.runTechnique();
        });
    },

    playSequence(sequence, idx, onComplete) {
        if (!this.running || idx >= sequence.length) {
            setTimeout(onComplete, 500);
            return;
        }
        
        const step = sequence[idx];
        this.updateGuide(`${step.action[0].toUpperCase() + step.action.slice(1)}... (${step.time}s)`);
        this.circle.style.background = this.getColor(step.action);
        this.animateCircle(step.action, step.time);
        this.timerDisplay.textContent = `0:${step.time < 10 ? '0'+step.time : step.time}`;
        
        setTimeout(() => {
            this.playSequence(sequence, idx+1, onComplete);
        }, step.time*1000);
    },

    getColor(action) {
        const colors = {
            inhale: '#10B981',
            exhale: '#3B82F6',
            hold: '#F59E0B'
        };
        return colors[action] || '#CBD5E1';
    },

    animateCircle(action, seconds) {
        if (!this.circle) return;
        // Animate scale
        let scale = 1;
        if (action === 'inhale') scale = 1.2;
        else if (action === 'exhale') scale = 0.9;
        else scale = 1;
        this.circle.style.transition = `transform ${seconds}s linear`;
        this.circle.style.transform = `scale(${scale})`;
        // Restore after
        setTimeout(() => {
            this.circle.style.transform = 'scale(1)';
        }, seconds*1000);
    },

    pause() {
        this.running = false;
        this.updateGuide('Paused');
    },

    stop() {
        this.running = false;
        this.updateGuide('Ready to breathe?');
        this.cycles = 1;
        this.updateCycle();
        if (this.controls) this.controls.style.display = 'none';
        this.circle.style.transform = 'scale(1)';
        this.circle.style.background = '#fff';
        this.timerDisplay.textContent = '0:00';
    },

    updateGuide(text) {
        if (this.guide) this.guide.textContent = text;
    },

    updateCycle() {
        if (this.cyclesDisplay) this.cyclesDisplay.textContent = `Cycle ${this.cycles}`;
    }
};

// On DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BreathingTool.init());
} else {
    BreathingTool.init();
}

window.BreathingTool = BreathingTool;
