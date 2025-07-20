// Main website functionality
class AccessibleGamesWebsite {
    constructor() {
        this.currentSection = 'home';
        this.currentGame = null;
        this.initializeWebsite();
    }
    
    initializeWebsite() {
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeAccessibility();
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }
    
    setupEventListeners() {
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('game-modal');
            if (event.target === modal) {
                this.closeGame();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGame();
            }
        });
        
        // Touch support for mobile
        document.addEventListener('touchstart', () => {
            this.enableAudioContext();
        });
    }
    
    initializeAccessibility() {
        // Add ARIA labels and roles
        this.addAriaLabels();
        
        // Check for accessibility preferences
        this.checkAccessibilityPreferences();
    }
    
    addAriaLabels() {
        // Add ARIA labels to navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.setAttribute('aria-label', `Navigate to ${link.textContent} section`);
            link.setAttribute('role', 'tab');
            link.setAttribute('tabindex', '0');
        });
        
        // Add ARIA labels to game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            if (!card.classList.contains('coming-soon')) {
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', `Play ${card.querySelector('h3').textContent}`);
            }
        });
    }
    
    checkAccessibilityPreferences() {
        // Check for high contrast mode
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Check for dark mode
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
    }
    
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });
        
        this.currentSection = sectionName;
        
        // Update URL hash
        window.location.hash = sectionName;
    }
    
    loadGame(gameName) {
        if (this.currentGame) {
            this.closeGame();
        }
        
        const modal = document.getElementById('game-modal');
        const gameContainer = document.getElementById('game-container');
        
        // Clear previous game
        gameContainer.innerHTML = '';
        
        // Load specific game
        switch (gameName) {
            case 'emotion-match':
                this.loadEmotionMatchGame(gameContainer);
                break;
            case 'sound-patterns':
                this.loadSoundPatternsGame(gameContainer);
                break;
            case 'color-shape-match':
                this.loadColorShapeMatchGame(gameContainer);
                break;
            default:
                gameContainer.innerHTML = '<p>Game not found.</p>';
        }
        
        // Show modal
        modal.style.display = 'block';
        this.currentGame = gameName;
        
        // Focus management
        setTimeout(() => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }, 100);
    }
    
    loadEmotionMatchGame(container) {
        container.innerHTML = `
            <div class="game-container">
                <header class="game-header sticky-header">
                    <div class="header-left">
                        <h1>😊 Emotion Faces Match 😊</h1>
                    </div>
                    <div class="header-right">
                        <button id="settings-btn" class="btn icon" aria-label="Settings">⚙️</button>
                        <button id="close-btn" class="btn icon" aria-label="Close" onclick="window.website.closeGame()">✖️</button>
                    </div>
                </header>
                <div class="scorebar animated-bar">
                    <span>Score: <span id="score">0</span></span>
                    <span>Level: <span id="level">1</span></span>
                    <span id="timer-area">⏱️ <span id="timer">01:00</span></span>
                    <div class="progress-bar" aria-label="Progress">
                        <div id="progress-fill" class="progress-fill"></div>
                    </div>
                </div>
                <main class="game-main">
                    <div class="emotion-display">
                        <div class="main-emotion">
                            <div id="main-emotion-face" class="emotion-face large animated-face"></div>
                            <p id="emotion-instruction" class="instruction" aria-live="polite">Match the emotion!</p>
                        </div>
                    </div>
                    <div class="camera-controls-area">
                        <div id="camera-controls"></div>
                        <div id="face-status" class="face-status"></div>
                    </div>
                    <div class="matching-area">
                        <div class="options-container animated-options" id="options-container">
                            <!-- Emotion options will be generated here -->
                        </div>
                    </div>
                    <div class="feedback-area">
                        <div id="feedback-message" class="feedback-message animated-feedback" aria-live="assertive"></div>
                    </div>
                </main>
                <!-- Fixed bottom controls -->
                <div class="controls fixed-controls">
                    <button id="new-game-btn" class="btn primary">New Game</button>
                    <button id="pause-btn" class="btn secondary">Pause</button>
                    <button id="help-btn" class="btn secondary">Help</button>
                </div>
            </div>
        `;
        // Settings modal is now outside the game container, see index.html or modal root.
        if (window.EmotionMatchGame) {
            new window.EmotionMatchGame();
        }
    }
    
    loadSoundPatternsGame(container) {
        container.innerHTML = `
            <div class="coming-soon-game">
                <h2>🎵 Sound Patterns Game</h2>
                <p>This game is coming soon! Stay tuned for musical fun.</p>
                <div class="placeholder-content">
                    <span class="large-icon">🎵</span>
                    <p>Match sounds and create musical patterns</p>
                </div>
            </div>
        `;
    }
    
    loadColorShapeMatchGame(container) {
        container.innerHTML = `
            <div class="coming-soon-game">
                <h2>🎨 Color & Shape Match</h2>
                <p>This game is coming soon! Get ready for colorful learning.</p>
                <div class="placeholder-content">
                    <span class="large-icon">🎨</span>
                    <p>Learn colors and shapes through interactive play</p>
                </div>
            </div>
        `;
    }
    
    closeGame() {
        const modal = document.getElementById('game-modal');
        modal.style.display = 'none';
        this.currentGame = null;
        
        // Return focus to the page
        const activeNavLink = document.querySelector('.nav-link.active');
        if (activeNavLink) {
            activeNavLink.focus();
        }
    }
    
    enableAudioContext() {
        // Enable audio context on first touch (required for iOS)
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.resume();
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    if (window.website) {
        window.website.showSection(sectionName);
    }
}

function loadGame(gameName) {
    if (gameName === 'calm-quest') {
        gameUrl = 'accesiblegames/calm-quest.html';
    }
    if (gameName === 'emotion-match') {
        // Inject the required HTML for the game
        document.getElementById('game-container').innerHTML = `
            <div class="emotion-display">
                <div id="main-emotion-face"></div>
                <div id="emotion-instruction"></div>
                <div id="options-container"></div>
                <div id="feedback-message" class="feedback-message"></div>
                <div class="score-level">
                    <span>Score: <span id="score">0</span></span>
                    <span>Level: <span id="level">1</span></span>
                </div>
                <div class="progress-bar-bg">
                    <div id="progress-fill"></div>
                </div>
                <div>
                    <button id="new-game-btn" class="btn">New Game</button>
                    <button id="help-btn" class="btn">Help</button>
                </div>
            </div>
        `;
        // Show the modal
        document.getElementById('game-modal').style.display = 'block';
        // Initialize the game
        window.emotionGame = new EmotionMatchGame();
    }
}

function closeGame() {
    document.getElementById('game-modal').style.display = 'none';
    document.getElementById('game-container').innerHTML = '';
    if (window.emotionGame && typeof window.emotionGame.cleanup === 'function') {
        window.emotionGame.cleanup();
    }
}

// Optional: Hide modal when clicking outside content
window.onclick = function(event) {
    const modal = document.getElementById('game-modal');
    if (event.target === modal) {
        closeGame();
    }
}

// Settings modal logic
function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseBtn = document.getElementById('settings-close-btn');

    if (settingsBtn && settingsModal && settingsCloseBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            settingsModal.setAttribute('aria-modal', 'true');
            settingsModal.setAttribute('role', 'dialog');
            settingsCloseBtn.focus();
        });
        settingsCloseBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
        // Keyboard accessibility: ESC closes modal
        document.addEventListener('keydown', (e) => {
            if (settingsModal.style.display === 'block' && e.key === 'Escape') {
                settingsModal.style.display = 'none';
            }
        });
    }
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.website = new AccessibleGamesWebsite();
    
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        window.website.showSection(hash);
    }
    setupSettingsModal();
}); 