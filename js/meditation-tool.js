// Simple meditation timer with locally saved completed-session totals.
const MeditationTool = (() => {
    let interval = null;
    let secondsLeft = 300;
    let sessionLength = 300;
    let running = false;
    let sessionsCount = 0;
    let minutesCount = 0;

    function readStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('meditationStats') || '{}');
            sessionsCount = Number(stats.sessions) || 0;
            minutesCount = Number(stats.minutes) || 0;
        } catch (_) { sessionsCount = 0; minutesCount = 0; }
    }
    function display() {
        const timer = document.getElementById('meditation-timer');
        if (timer) timer.textContent = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
        const progress = document.getElementById('meditation-progress');
        if (progress) progress.style.width = `${Math.max(0, Math.min(100, 100 * (1 - secondsLeft / sessionLength)))}%`;
        const sessions = document.getElementById('meditation-sessions');
        const minutes = document.getElementById('meditation-minutes');
        if (sessions) sessions.textContent = sessionsCount;
        if (minutes) minutes.textContent = minutesCount;
        const play = document.getElementById('meditation-play-btn');
        const pause = document.getElementById('meditation-pause-btn');
        if (play) play.style.display = running ? 'none' : 'inline-flex';
        if (pause) { pause.style.display = running ? 'inline-flex' : 'none'; pause.textContent = 'Pause'; }
        document.querySelectorAll('.meditation-controls .control-btn').forEach(button => {
            button.classList.toggle('active', Number(button.dataset.time) === sessionLength);
            button.disabled = running;
        });
    }
    function setTimer(seconds) {
        if (running || !Number.isFinite(seconds) || seconds <= 0) return;
        clearInterval(interval);
        sessionLength = seconds;
        secondsLeft = seconds;
        display();
    }
    function startSession() {
        if (running) return;
        if (secondsLeft <= 0) secondsLeft = sessionLength;
        running = true;
        const music = document.getElementById('meditation-music');
        if (music) { music.loop = true; music.play().catch(() => {}); }
        display();
        interval = setInterval(() => {
            if (secondsLeft > 0) { secondsLeft -= 1; display(); }
            if (secondsLeft <= 0) completeSession();
        }, 1000);
    }
    function pauseSession() {
        if (!running) return;
        running = false;
        clearInterval(interval);
        const music = document.getElementById('meditation-music');
        if (music) music.pause();
        display();
    }
    function completeSession() {
        clearInterval(interval);
        running = false;
        const music = document.getElementById('meditation-music');
        if (music) { music.pause(); music.currentTime = 0; }
        const bell = document.getElementById('end-sound');
        if (bell) bell.play().catch(() => {});
        sessionsCount += 1;
        minutesCount += Math.round(sessionLength / 60);
        try { localStorage.setItem('meditationStats', JSON.stringify({ sessions: sessionsCount, minutes: minutesCount })); } catch (_) { /* timer remains usable */ }
        secondsLeft = sessionLength;
        display();
        const message = document.getElementById('meditation-status');
        if (message) message.textContent = 'Session complete. Take a moment before returning to your day.';
    }
    function init() { readStats(); display(); }
    init();
    return { init, setTimer, startSession, pauseSession };
})();
window.MeditationTool = MeditationTool;
