// mood-tracker.js - Daily Wellness Check-In functionality

class MoodTracker {
    constructor() {
        this.currentMood = null;
        this.entries = this.loadEntries();
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.bindEvents();
        this.updateStats();
        this.checkTodayEntry();
        this.initialized = true;
        console.log('MoodTracker initialized');
    }

    bindEvents() {
        // Bind mood selection events
        const moodOptions = document.querySelectorAll('.mood-option');
        moodOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const mood = parseInt(e.currentTarget.dataset.mood);
                this.selectMood(mood);
            });

            // Keyboard support
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const mood = parseInt(e.currentTarget.dataset.mood);
                    this.selectMood(mood);
                }
            });
        });

        // Bind submit button
        const submitBtn = document.getElementById('mood-submit') || document.getElementById('save-mood-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitMood());
        }

        // Word count for notes
        const moodNote = document.getElementById('mood-note') || document.getElementById('mood-notes-textarea');
        if (moodNote) {
            moodNote.addEventListener('input', this.updateNoteStats.bind(this));
        }
    }

    selectMood(moodValue) {
        // Remove previous selection
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
            option.setAttribute('aria-checked', 'false');
        });

        // Select current mood
        const selectedOption = document.querySelector(`[data-mood="${moodValue}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            selectedOption.setAttribute('aria-checked', 'true');
            
            // Add visual feedback
            selectedOption.style.transform = 'scale(1.05)';
            setTimeout(() => {
                selectedOption.style.transform = '';
            }, 200);
        }
        
        this.currentMood = moodValue;
        
        // Enable submit button
        const submitBtn = document.getElementById('mood-submit') || document.getElementById('save-mood-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.add('enabled');
        }

        // Show mood-specific encouragement
        this.showMoodEncouragement(moodValue);
    }

    showMoodEncouragement(mood) {
        const encouragements = {
            1: "I see you're having a tough day. Remember, it's okay to feel this way, and tomorrow can be different. 💙",
            2: "Difficult feelings are temporary. You're brave for acknowledging how you feel. 🌈",
            3: "Neutral days are okay too. Sometimes we need these moments to rest and reset. ⭐",
            4: "It's wonderful that you're feeling positive today! Keep nurturing what makes you feel good. 🌟",
            5: "Amazing! Your joy is beautiful. Remember this feeling - you deserve all this happiness. ✨"
        };

        // Show temporary encouragement message
        const encouragement = encouragements[mood];
        if (encouragement) {
            this.showNotification(encouragement, 'encouragement', 6000);
        }
    }

    submitMood() {
        if (this.currentMood === null) {
            this.showNotification('Please select your mood first.', 'warning');
            return;
        }
        
        const noteElement = document.getElementById('mood-note') || document.getElementById('mood-notes-textarea');
        const note = noteElement ? noteElement.value.trim() : '';
        
        const moodEntry = {
            id: Date.now(),
            mood: this.currentMood,
            note: note,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
            weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        if (!this.saveMoodEntry(moodEntry)) return;
        this.showSuccess();
        this.updateStats();
        this.resetForm();
    }

    saveMoodEntry(entry) {
        const previousEntries = this.entries.slice();
        // Remove any existing entry for today
        const today = entry.date;
        this.entries = this.entries.filter(e => e.date !== today);
        
        // Add new entry
        this.entries.push(entry);
        
        // Sort by timestamp (newest first)
        this.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Keep only last 90 days
        this.entries = this.entries.slice(0, 90);
        
        // Save to localStorage
        try {
            localStorage.setItem('moodEntries', JSON.stringify(this.entries));
        } catch (error) {
            this.entries = previousEntries;
            this.showNotification('Could not save this check-in in browser storage. Your previous entries are still available.', 'error');
            return false;
        }
        
        console.log('Mood entry saved:', entry);
        return true;
    }

    loadEntries() {
        try {
            const stored = localStorage.getItem('moodEntries');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading mood entries:', error);
            return [];
        }
    }

    showSuccess() {
        const moodNames = ['', 'Very Sad', 'Sad', 'Neutral', 'Good', 'Great'];
        const moodName = moodNames[this.currentMood];
        
        this.showNotification(`Mood "${moodName}" saved successfully! 🎉 Keep taking care of yourself.`, 'success');
        
        // Add celebration animation
        const selectedOption = document.querySelector('.mood-option.selected');
        if (selectedOption) {
            selectedOption.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                selectedOption.style.animation = '';
            }, 600);
        }
    }

    resetForm() {
        this.currentMood = null;
        
        // Reset mood options
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
            option.setAttribute('aria-checked', 'false');
        });
        
        // Reset note
        const noteElement = document.getElementById('mood-note') || document.getElementById('mood-notes-textarea');
        if (noteElement) {
            noteElement.value = '';
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('mood-submit') || document.getElementById('save-mood-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.remove('enabled');
        }
    }

    updateStats() {
        this.updateWellnessStreak();
        this.updateMoodTrends();
    }

    updateWellnessStreak() {
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        
        // Check consecutive days going backwards
        while (true) {
            const dateStr = checkDate.toDateString();
            const hasEntry = this.entries.some(entry => entry.date === dateStr);
            
            if (hasEntry) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr === today.toDateString()) {
                // Skip today if no entry yet (don't break streak)
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        const streakElement = document.getElementById('wellness-streak');
        if (streakElement) {
            streakElement.textContent = streak;
            
            // Add streak milestone celebrations
            if (streak > 0 && streak % 7 === 0) {
                streakElement.style.animation = 'bounce 1s ease-in-out';
                setTimeout(() => {
                    streakElement.style.animation = '';
                }, 1000);
            }
        }

        const calendar = document.getElementById('streak-calendar');
        if (calendar) {
            calendar.replaceChildren();
            for (let offset = 27; offset >= 0; offset--) {
                const date = new Date();
                date.setDate(date.getDate() - offset);
                const day = document.createElement('span');
                day.className = 'calendar-day';
                if (this.entries.some(entry => entry.date === date.toDateString())) day.classList.add('checked-in');
                if (offset === 0) day.classList.add('today');
                day.textContent = String(date.getDate());
                day.title = `${date.toLocaleDateString()}${day.classList.contains('checked-in') ? ' · checked in' : ''}`;
                calendar.appendChild(day);
            }
        }
    }

    updateMoodTrends() {
        const chartContainer = document.getElementById('mood-chart');
        if (!chartContainer) return;

        if (this.entries.length === 0) {
            chartContainer.innerHTML = '<p class="chart-placeholder">Check in daily to see your mood patterns and trends.</p>';
            return;
        }

        // Get last 7 days of entries
        const last7Days = this.getLast7DaysEntries();
        
        if (last7Days.length === 0) {
            chartContainer.innerHTML = '<p class="chart-placeholder">Keep checking in to see your weekly trends!</p>';
            return;
        }

        // Create simple visual representation
        const trendHTML = this.createMoodTrendHTML(last7Days);
        chartContainer.innerHTML = trendHTML;
    }

    getLast7DaysEntries() {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toDateString();
            
            const entry = this.entries.find(e => e.date === dateStr);
            last7Days.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                mood: entry ? entry.mood : null,
                hasEntry: !!entry
            });
        }
        
        return last7Days;
    }

    createMoodTrendHTML(days) {
        const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];
        const moodColors = ['', '#C87870', '#C99A70', '#8A9690', '#709780', '#527A68'];
        
        let html = '<div class="mood-trend-chart">';
        
        days.forEach(day => {
            const emoji = day.mood ? moodEmojis[day.mood] : '⚪';
            const color = day.mood ? moodColors[day.mood] : '#DCE4DE';
            
            html += `
                <div class="trend-day" title="${day.day} - ${day.hasEntry ? 'Mood logged' : 'No entry'}">
                    <div class="trend-emoji">${emoji}</div>
                    <div class="trend-label">${day.day}</div>
                    <div class="trend-bar" style="background-color: ${color}; height: ${day.mood ? day.mood * 20 : 10}%"></div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add average mood calculation
        const moodsWithEntries = days.filter(d => d.mood).map(d => d.mood);
        if (moodsWithEntries.length > 0) {
            const avgMood = (moodsWithEntries.reduce((a, b) => a + b, 0) / moodsWithEntries.length).toFixed(1);
            const avgEmoji = moodEmojis[Math.round(avgMood)];
            html += `<div class="trend-summary">Weekly average: ${avgEmoji} ${avgMood}/5</div>`;
        }
        
        return html;
    }

    checkTodayEntry() {
        const today = new Date().toDateString();
        const todayEntry = this.entries.find(entry => entry.date === today);
        
        if (todayEntry) {
            // Pre-fill today's entry
            this.selectMood(todayEntry.mood);
            const noteElement = document.getElementById('mood-note') || document.getElementById('mood-notes-textarea');
            if (noteElement && todayEntry.note) {
                noteElement.value = todayEntry.note;
            }
            
            this.showNotification('You already checked in today! You can update your mood if it changed.', 'info');
        }
    }

    updateNoteStats(event) {
        const text = event.target.value;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        // You can add a word counter display here if needed
        // For now, just store the count
        event.target.setAttribute('data-word-count', wordCount);
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.mood-notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `mood-notification ${type}`;
        notification.textContent = message;
        
        // Styling
        const styles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '12px',
            color: 'white',
            zIndex: '10000',
            maxWidth: '350px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            animation: 'slideInRight 0.3s ease-out'
        };
        
        Object.assign(notification.style, styles);
        
        // Set background color based on type
        const colors = {
            success: '#527A68',
            error: '#944940',
            warning: '#98763F',
            info: '#527A74',
            encouragement: '#667C91'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Static method for external use
    static saveMoodEntry(entry) {
        const tracker = new MoodTracker();
        tracker.saveMoodEntry(entry);
    }

    // Export mood data (for potential future features)
    exportData() {
        const data = {
            entries: this.entries,
            exportDate: new Date().toISOString(),
            totalEntries: this.entries.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mood-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Mood data exported successfully!', 'success');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    .mood-option.selected {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(82, 122, 116, 0.22);
        border: 2px solid #527A74;
    }
    
    .mood-trend-chart {
        display: flex;
        justify-content: space-between;
        align-items: end;
        height: 100px;
        margin: 15px 0;
        padding: 10px;
        background: #F4F6F2;
        border-radius: 8px;
    }
    
    .trend-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }
    
    .trend-emoji {
        font-size: 20px;
        margin-bottom: 5px;
    }
    
    .trend-label {
        font-size: 10px;
        color: #687A73;
        margin-bottom: 5px;
    }
    
    .trend-bar {
        width: 20px;
        min-height: 4px;
        border-radius: 2px;
        transition: height 0.3s ease;
    }
    
    .trend-summary {
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #344943;
    }
`;

if (!document.head.querySelector('#mood-tracker-styles')) {
    style.id = 'mood-tracker-styles';
    document.head.appendChild(style);
}

// Global functions for backward compatibility
function selectMood(mood) {
    if (window.moodTrackerInstance) {
        window.moodTrackerInstance.selectMood(mood);
    }
}

function submitMood() {
    if (window.moodTrackerInstance) {
        window.moodTrackerInstance.submitMood();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMoodTracker);
} else {
    initializeMoodTracker();
}

function initializeMoodTracker() {
    if (!window.moodTrackerInstance) {
        window.moodTrackerInstance = new MoodTracker();
        window.moodTrackerInstance.init();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoodTracker;
}

// Make available globally
window.MoodTracker = MoodTracker;
