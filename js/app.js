// ===================================
// CampusMind Mental Health Platform
// Main Application JavaScript
// ===================================

// Application State Management
class CampusMindApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isInitialized = false;
        this.modules = {};

        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🧠 CampusMind App Initializing...');

        try {
            this.setupGlobalEventListeners();
            this.initializeModules();
            this.handleUrlRouting();
            this.loadUserPreferences();
            this.setupAccessibilityFeatures();
            this.initializeAnimations();

            this.isInitialized = true;
            console.log('✅ CampusMind App Initialized Successfully');

            // Trigger custom event for other modules
            document.dispatchEvent(new CustomEvent('campusmind:initialized'));

        } catch (error) {
            console.error('❌ App Initialization Error:', error);
            this.showErrorFallback();
        }
    }

    setupGlobalEventListeners() {
        // Navigation handling
        this.setupNavigation();

        // Mobile menu toggle
        this.setupMobileMenu();

        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();

        // Language switching
        this.setupLanguageHandling();

        // Emergency support tracking
        this.trackEmergencyInteractions();

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Window resize handling
        this.handleWindowResize();

        // Online/offline detection
        this.setupNetworkDetection();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    this.smoothScrollToElement(targetElement);
                    this.updateActiveNavLink(link);

                    // Update URL without triggering reload
                    history.pushState(null, '', `#${targetId}`);

                    // Announce to screen readers
                    this.announceToScreenReader(`Navigated to ${targetElement.querySelector('h1, h2, h3')?.textContent || targetId}`);
                }
            });
        });
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

                menuToggle.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');

                // Update icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
                }

                // Focus management
                if (!isExpanded) {
                    navLinks.querySelector('a')?.focus();
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').className = 'fas fa-bars';
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                    menuToggle.click();
                    menuToggle.focus();
                }
            });
        }
    }

    setupSmoothScrolling() {
        // Polyfill for browsers that don't support smooth scrolling
        if (!CSS.supports('scroll-behavior', 'smooth')) {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        this.smoothScrollToElement(target);
                    }
                });
            });
        }
    }

    smoothScrollToElement(element, offset = 100) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    setupLanguageHandling() {
        const languageSelect = document.getElementById('language-select');

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });

            // Load saved language preference
            const savedLanguage = localStorage.getItem('campusmind-language');
            if (savedLanguage) {
                this.changeLanguage(savedLanguage);
                languageSelect.value = savedLanguage;
            }
        }
    }

    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
        localStorage.setItem('campusmind-language', languageCode);

        // Update HTML lang attribute
        document.documentElement.lang = languageCode;

        // Trigger language change event for modules
        document.dispatchEvent(new CustomEvent('campusmind:languageChanged', {
            detail: { language: languageCode }
        }));

        // Update UI text (in a real app, this would load translation files)
        this.updateUILanguage(languageCode);

        this.announceToScreenReader(`Language changed to ${this.getLanguageName(languageCode)}`);
    }

    updateUILanguage(languageCode) {
        // Placeholder for language switching logic
        // In a real implementation, this would load translation files
        const messages = {
            'en': { title: 'Your Mental Health Matters', subtitle: 'A safe, supportive space for students' },
            'hi': { title: 'आपका मानसिक स्वास्थ्य महत्वपूर्ण है', subtitle: 'छात्रों के लिए एक सुरक्षित, सहायक स्थान' },
            'ta': { title: 'உங்கள் மன நலம் முக்கியம்', subtitle: 'மாணவர்களுக்கு பாதுகாப்பான, ஆதரவான இடம்' }
        };

        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');

        if (heroTitle && messages[languageCode]) {
            heroTitle.textContent = messages[languageCode].title;
        }

        if (heroSubtitle && messages[languageCode]) {
            heroSubtitle.textContent = messages[languageCode].subtitle;
        }
    }

    getLanguageName(languageCode) {
        const languageNames = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'bn': 'Bengali',
            'te': 'Telugu',
            'mr': 'Marathi'
        };
        return languageNames[languageCode] || 'Unknown';
    }

    trackEmergencyInteractions() {
        // Track crisis support usage for analytics (anonymously)
        document.querySelectorAll('a[href^="tel:"], .crisis-link, .emergency-btn').forEach(element => {
            element.addEventListener('click', () => {
                // Log emergency interaction (anonymized)
                this.logEvent('emergency_support_accessed', {
                    timestamp: new Date().toISOString(),
                    type: 'crisis_helpline'
                });

                // Show supportive message
                setTimeout(() => {
                    this.showNotification('Help is on the way. You made a brave choice reaching out. 💚', 'success', 5000);
                }, 100);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + ? = Show help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Ctrl/Cmd + M = Go to mood tracker
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                const moodTracker = document.getElementById('mood-tracker');
                if (moodTracker) {
                    this.smoothScrollToElement(moodTracker);
                }
            }

            // Ctrl/Cmd + E = Emergency support
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (window.CrisisSupport) {
                    CrisisSupport.showEmergencyModal();
                }
            }

            // Escape = Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    handleWindowResize() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Update charts and responsive elements
                document.dispatchEvent(new CustomEvent('campusmind:windowResized'));
            }, 250);
        });
    }

    setupNetworkDetection() {
        if ('navigator' in window && 'onLine' in navigator) {
            window.addEventListener('online', () => {
                this.showNotification('Connection restored. All features are available.', 'success');
                document.dispatchEvent(new CustomEvent('campusmind:networkOnline'));
            });

            window.addEventListener('offline', () => {
                this.showNotification('You're offline. Some features may be limited.', 'warning', 10000);
                document.dispatchEvent(new CustomEvent('campusmind:networkOffline'));
            });
        }
    }

    initializeModules() {
        // Initialize all feature modules
        const modulePromises = [];

        // Core modules
        if (window.MoodTracker) {
            this.modules.moodTracker = new MoodTracker();
            modulePromises.push(this.modules.moodTracker.init());
        }

        if (window.MeditationTool) {
            this.modules.meditationTool = new MeditationTool();
            modulePromises.push(this.modules.meditationTool.init());
        }

        if (window.BreathingTool) {
            this.modules.breathingTool = new BreathingTool();
            modulePromises.push(this.modules.breathingTool.init());
        }

        if (window.JournalTool) {
            this.modules.journalTool = new JournalTool();
            modulePromises.push(this.modules.journalTool.init());
        }

        if (window.AssessmentTool) {
            this.modules.assessmentTool = new AssessmentTool();
            modulePromises.push(this.modules.assessmentTool.init());
        }

        if (window.ResourceLibrary) {
            this.modules.resourceLibrary = new ResourceLibrary();
            modulePromises.push(this.modules.resourceLibrary.init());
        }

        if (window.CrisisSupport) {
            this.modules.crisisSupport = new CrisisSupport();
            modulePromises.push(this.modules.crisisSupport.init());
        }

        if (window.PeerSupport) {
            this.modules.peerSupport = new PeerSupport();
            modulePromises.push(this.modules.peerSupport.init());
        }

        if (window.ProfessionalSupport) {
            this.modules.professionalSupport = new ProfessionalSupport();
            modulePromises.push(this.modules.professionalSupport.init());
        }

        // Wait for all modules to initialize
        Promise.all(modulePromises).then(() => {
            console.log('✅ All modules initialized successfully');
        }).catch(error => {
            console.error('❌ Module initialization error:', error);
        });
    }

    handleUrlRouting() {
        // Handle initial page load with hash
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                setTimeout(() => {
                    this.smoothScrollToElement(targetElement);
                    this.updateActiveNavLink(document.querySelector(`a[href="${hash}"]`));
                }, 100);
            }
        }

        // Handle back/forward navigation
        window.addEventListener('popstate', () => {
            const hash = window.location.hash;
            if (hash) {
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    this.smoothScrollToElement(targetElement);
                    this.updateActiveNavLink(document.querySelector(`a[href="${hash}"]`));
                }
            }
        });
    }

    loadUserPreferences() {
        // Load saved preferences from localStorage
        const preferences = {
            language: localStorage.getItem('campusmind-language') || 'en',
            theme: localStorage.getItem('campusmind-theme') || 'default',
            accessibility: JSON.parse(localStorage.getItem('campusmind-accessibility') || '{}'),
            notifications: JSON.parse(localStorage.getItem('campusmind-notifications') || '{"enabled": true}')
        };

        // Apply preferences
        this.applyUserPreferences(preferences);
    }

    applyUserPreferences(preferences) {
        // Apply language preference
        if (preferences.language !== 'en') {
            this.changeLanguage(preferences.language);
        }

        // Apply accessibility preferences
        if (preferences.accessibility.highContrast) {
            document.body.classList.add('high-contrast');
        }

        if (preferences.accessibility.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }

        if (preferences.accessibility.fontSize) {
            document.documentElement.style.fontSize = preferences.accessibility.fontSize;
        }

        console.log('✅ User preferences applied');
    }

    setupAccessibilityFeatures() {
        // Screen reader announcements
        this.createAriaLiveRegion();

        // Focus management
        this.setupFocusManagement();

        // Skip links
        this.enhanceSkipLinks();

        // High contrast detection
        this.detectHighContrastPreference();

        // Reduced motion detection
        this.detectReducedMotionPreference();
    }

    createAriaLiveRegion() {
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupFocusManagement() {
        // Track focus for better keyboard navigation
        let focusedElement = null;

        document.addEventListener('focusin', (e) => {
            focusedElement = e.target;
        });

        // Return focus to appropriate element after modal closes
        document.addEventListener('campusmind:modalClosed', (e) => {
            if (focusedElement && focusedElement.focus) {
                focusedElement.focus();
            }
        });
    }

    enhanceSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    detectHighContrastPreference() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast-preference');
        }
    }

    detectReducedMotionPreference() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion-preference');
        }
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe elements for animation
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                animationObserver.observe(el);
            });
        }

        // Count-up animations for stats
        this.initializeCounterAnimations();
    }

    initializeCounterAnimations() {
        const stats = document.querySelectorAll('.stat-number[data-target]');

        if ('IntersectionObserver' in window) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        statsObserver.unobserve(entry.target);
                    }
                });
            });

            stats.forEach(stat => statsObserver.observe(stat));
        } else {
            // Fallback for older browsers
            stats.forEach(stat => this.animateCounter(stat));
        }
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = 0;
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-remove
        const removeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        };

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', removeNotification);

        // Auto-close
        if (duration > 0) {
            setTimeout(removeNotification, duration);
        }

        // Announce to screen readers
        this.announceToScreenReader(message);
    }

    showErrorFallback() {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-fallback';
        errorMessage.innerHTML = `
            <div class="error-content">
                <h2>⚠️ Something went wrong</h2>
                <p>We're experiencing technical difficulties. Please try refreshing the page.</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    <i class="fas fa-refresh"></i>
                    Refresh Page
                </button>
                <p><small>If the problem persists, emergency support is still available:</small></p>
                <a href="tel:1800-599-0019" class="btn btn-danger">
                    <i class="fas fa-phone"></i>
                    Call Crisis Helpline
                </a>
            </div>
        `;

        document.body.appendChild(errorMessage);
    }

    logEvent(eventName, data = {}) {
        // Anonymous event logging for improving the platform
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: this.currentLanguage,
            ...data
        };

        // Store locally (in a real app, this might be sent to analytics)
        const logs = JSON.parse(localStorage.getItem('campusmind-logs') || '[]');
        logs.push(eventData);

        // Keep only last 100 events
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }

        localStorage.setItem('campusmind-logs', JSON.stringify(logs));

        console.log('📊 Event logged:', eventName, data);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });

        document.dispatchEvent(new CustomEvent('campusmind:modalClosed'));
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { keys: 'Ctrl/Cmd + M', description: 'Go to Mood Tracker' },
            { keys: 'Ctrl/Cmd + E', description: 'Emergency Support' },
            { keys: 'Ctrl/Cmd + /', description: 'Show this help' },
            { keys: 'Escape', description: 'Close modals' },
            { keys: 'Tab', description: 'Navigate between elements' },
            { keys: 'Enter/Space', description: 'Activate buttons and links' }
        ];

        const modal = document.createElement('div');
        modal.className = 'modal keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" role="dialog" aria-labelledby="shortcuts-title">
                <div class="modal-header">
                    <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
                    <button class="modal-close" aria-label="Close help">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-list">
                        ${shortcuts.map(shortcut => `
                            <div class="shortcut-item">
                                <kbd class="shortcut-keys">${shortcut.keys}</kbd>
                                <span class="shortcut-description">${shortcut.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // Focus management
        modal.querySelector('.modal-close').focus();

        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => document.body.removeChild(modal), 300);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.querySelector('.modal-close').click();
        });
    }

    // Public API methods
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    isReady() {
        return this.isInitialized;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize the application
const campusMindApp = new CampusMindApp();

// Make app globally accessible
window.CampusMindApp = campusMindApp;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampusMindApp;
}