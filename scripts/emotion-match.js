// Enhanced Emotion Faces Match Game with Face Recognition
class EmotionMatchGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentEmotion = null;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.isGameActive = false;
        
        // Face recognition properties
        this.video = null;
        this.canvas = null;
        this.faceApi = null;
        this.isFaceDetectionActive = false;
        this.currentPlayerEmotion = null;
        this.faceDetectionInterval = null;
        this.isFaceApiLoaded = false;
        
        // Emotion data with emojis and words
        this.emotions = [
            { emoji: '😊', word: 'Happy', color: '#fbbf24' },
            { emoji: '😢', word: 'Sad', color: '#60a5fa' },
            { emoji: '😠', word: 'Angry', color: '#f87171' },
            { emoji: '😨', word: 'Scared', color: '#a78bfa' },
            { emoji: '😴', word: 'Sleepy', color: '#34d399' },
            { emoji: '🤔', word: 'Confused', color: '#fbbf24' },
            { emoji: '😲', word: 'Surprised', color: '#f472b6' },
            { emoji: '😐', word: 'Neutral', color: '#9ca3af' }
        ];
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    async initializeGame() {
        this.updateDisplay();
        this.generateNewQuestion();
        this.isGameActive = true;
        
        // Always create camera interface first
        this.createCameraInterface();
        
        // Then try to initialize face detection
        this.initializeFaceDetection();
    }
    
    createCameraInterface() {
        // Remove existing camera interface if any
        const existingVideo = document.querySelector('#face-video');
        if (existingVideo) {
            existingVideo.parentElement.remove();
        }
        
        const existingControls = document.querySelector('.camera-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        const existingStatus = document.querySelector('.face-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create video element
        this.video = document.createElement('video');
        this.video.id = 'face-video';
        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.style.cssText = `
            width: 320px;
            height: 240px;
            border-radius: 15px;
            border: 3px solid #4facfe;
            margin: 10px auto;
            display: block;
            background: #f0f0f0;
            object-fit: cover;
        `;
        
        // Create canvas for face detection
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'face-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 320px;
            height: 240px;
            border-radius: 15px;
            pointer-events: none;
        `;
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            position: relative;
            width: 320px;
            margin: 10px auto;
            display: flex;
            justify-content: center;
        `;
        
        videoContainer.appendChild(this.video);
        videoContainer.appendChild(this.canvas);
        
        // Create camera controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'camera-controls';
        controlsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 15px 0;
            flex-wrap: wrap;
        `;
        
        const startCameraBtn = document.createElement('button');
        startCameraBtn.textContent = '📷 Start Camera';
        startCameraBtn.className = 'btn secondary';
        startCameraBtn.onclick = () => this.startCamera();
        
        const stopCameraBtn = document.createElement('button');
        stopCameraBtn.textContent = '⏹️ Stop Camera';
        stopCameraBtn.className = 'btn secondary';
        stopCameraBtn.onclick = () => this.stopCamera();
        
        const toggleModeBtn = document.createElement('button');
        toggleModeBtn.textContent = '🎯 Face Mode';
        toggleModeBtn.className = 'btn primary';
        toggleModeBtn.onclick = () => this.toggleFaceMode();
        
        controlsContainer.appendChild(startCameraBtn);
        controlsContainer.appendChild(stopCameraBtn);
        controlsContainer.appendChild(toggleModeBtn);
        
        // Create status indicator
        const statusDiv = document.createElement('div');
        statusDiv.className = 'face-status';
        statusDiv.textContent = 'Camera ready. Click "Start Camera" to begin face recognition.';
        statusDiv.style.cssText = `
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px;
            margin: 10px 0;
            font-size: 0.9rem;
            color: #4a5568;
            width: 100%;
            text-align: center;
        `;
        
        // Insert everything into the emotion display
        const emotionDisplay = document.querySelector('.emotion-display');
        if (emotionDisplay) {
            emotionDisplay.appendChild(videoContainer);
            emotionDisplay.appendChild(controlsContainer);
            emotionDisplay.appendChild(statusDiv);
        }
        
        // Show a placeholder in the video until camera is started
        this.showVideoPlaceholder();
    }
    
    showVideoPlaceholder() {
        // Create a placeholder content for the video
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            font-family: 'Comic Neue', cursive;
        `;
        
        placeholder.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 10px;">📷</div>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">Camera</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Click "Start Camera" to begin</div>
        `;
        
        // Add placeholder to video element
        this.video.appendChild(placeholder);
    }
    
    async initializeFaceDetection() {
        try {
            // Wait for face-api.js to be available
            await this.waitForFaceApi();
            
            // Check if face-api is available
            if (typeof faceapi === 'undefined') {
                console.log('Face-api.js not loaded');
                this.updateFaceStatus('Face recognition not available. You can still play with the emotion cards!', 'not-detected');
                return;
            }
            
            // Load face-api.js models
            await this.loadFaceApiModels();
            
            // Start face detection
            this.startFaceDetection();
            
        } catch (error) {
            console.log('Face detection initialization failed:', error);
            this.updateFaceStatus('Face detection not available. You can still play with the emotion cards!', 'not-detected');
        }
    }
    
    async waitForFaceApi() {
        // Wait for face-api.js to be loaded
        let attempts = 0;
        const maxAttempts = 100; // Wait up to 10 seconds
        
        while (typeof faceapi === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            
            // Check if it's been loaded by the global loader
            if (window.faceApiLoaded) {
                console.log('Face-api.js loaded by global loader');
                break;
            }
        }
        
        if (typeof faceapi === 'undefined') {
            throw new Error('Face-api.js not loaded after waiting');
        }
        
        console.log('Face-api.js is available');
    }
    
    async loadFaceApiModels() {
        try {
            // Try multiple model sources
            const modelSources = [
                'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights',
                'https://unpkg.com/face-api.js@1/weights',
                'https://cdnjs.cloudflare.com/ajax/libs/face-api.js/1.0.0/weights'
            ];
            
            console.log('Loading face-api models...');
            
            let modelsLoaded = false;
            
            for (const MODEL_URL of modelSources) {
                try {
                    console.log(`Trying to load models from: ${MODEL_URL}`);
                    
                    await Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                    ]);
                    
                    console.log(`Successfully loaded models from: ${MODEL_URL}`);
                    modelsLoaded = true;
                    break;
                    
                } catch (error) {
                    console.log(`Failed to load models from ${MODEL_URL}:`, error);
                    continue;
                }
            }
            
            if (!modelsLoaded) {
                throw new Error('All model sources failed');
            }
            
            this.isFaceApiLoaded = true;
            console.log('Face API models loaded successfully');
            this.updateFaceStatus('Face recognition ready! Start camera to begin.', 'detected');
            
        } catch (error) {
            console.log('Failed to load Face API models:', error);
            this.isFaceApiLoaded = false;
            this.updateFaceStatus('Face recognition models failed to load. You can still play with the emotion cards!', 'not-detected');
        }
    }
    
    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 320, 
                    height: 240,
                    facingMode: 'user'
                } 
            });
            
            this.video.srcObject = stream;
            this.isFaceDetectionActive = true;
            this.updateFaceStatus('Camera started! Make facial expressions to play!', 'detected');
            
            // Remove placeholder when camera starts
            const placeholder = this.video.querySelector('div');
            if (placeholder) {
                placeholder.remove();
            }
            
            // Wait a bit for video to be ready, then start detection
            setTimeout(() => {
                if (this.isFaceApiLoaded) {
                    this.startFaceDetection();
                }
            }, 1000);
            
        } catch (error) {
            console.log('Camera access denied:', error);
            this.updateFaceStatus('Camera access denied. You can still play with the emotion cards!', 'not-detected');
            
            // Show error placeholder
            this.showErrorPlaceholder();
        }
    }
    
    showErrorPlaceholder() {
        // Clear any existing content
        this.video.innerHTML = '';
        
        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            color: white;
            border-radius: 12px;
            font-family: 'Comic Neue', cursive;
        `;
        
        errorPlaceholder.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 10px;">🚫</div>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">Camera Access Denied</div>
            <div style="font-size: 0.9rem; opacity: 0.8; text-align: center; padding: 0 10px;">
                Please allow camera access or use the emotion cards below
            </div>
        `;
        
        this.video.appendChild(errorPlaceholder);
    }
    
    stopCamera() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        this.isFaceDetectionActive = false;
        this.updateFaceStatus('Camera stopped.', 'not-detected');
        
        // Stop face detection
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }
        
        // Show placeholder again
        this.showVideoPlaceholder();
    }
    
    toggleFaceMode() {
        const toggleBtn = document.querySelector('.btn.primary');
        if (this.isFaceDetectionActive) {
            toggleBtn.textContent = '🎯 Face Mode';
            this.updateFaceStatus('Face mode disabled. Use emotion cards to play.', 'not-detected');
        } else {
            toggleBtn.textContent = '🎴 Card Mode';
            this.updateFaceStatus('Face mode enabled! Make expressions to match the emotion!', 'detected');
        }
    }
    
    updateFaceStatus(message, type) {
        const statusDiv = document.querySelector('.face-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `face-status ${type}`;
            
            if (type === 'detected') {
                statusDiv.style.background = '#c6f6d5';
                statusDiv.style.borderColor = '#68d391';
                statusDiv.style.color = '#22543d';
            } else {
                statusDiv.style.background = '#f7fafc';
                statusDiv.style.borderColor = '#e2e8f0';
                statusDiv.style.color = '#4a5568';
            }
        }
    }
    
    startFaceDetection() {
        if (!this.isFaceApiLoaded) {
            console.log('Face API not loaded, skipping face detection');
            return;
        }
        
        console.log('Starting face detection...');
        
        this.faceDetectionInterval = setInterval(async () => {
            if (this.isFaceDetectionActive && this.video && this.video.readyState === 4) {
                await this.detectFace();
            }
        }, 1000); // Check every second
    }
    
    async detectFace() {
        try {
            if (!this.isFaceApiLoaded || !this.video) return;
            
            console.log('Detecting faces...');
            
            const detections = await faceapi.detectAllFaces(
                this.video, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();
            
            console.log('Detections:', detections);
            
            if (detections.length > 0) {
                const face = detections[0];
                const expressions = face.expressions;
                
                console.log('Expressions:', expressions);
                
                // Get the emotion with highest confidence
                const emotions = Object.entries(expressions);
                emotions.sort((a, b) => b[1] - a[1]);
                const [emotion, confidence] = emotions[0];
                
                console.log('Top emotion:', emotion, 'confidence:', confidence);
                
                if (confidence > 0.5) { // Only consider if confidence is high enough
                    this.currentPlayerEmotion = this.mapApiEmotionToGameEmotion(emotion);
                    console.log('Mapped emotion:', this.currentPlayerEmotion);
                    this.checkFaceMatch();
                    this.updateFaceStatus(`Detected: ${this.currentPlayerEmotion} (${Math.round(confidence * 100)}%)`, 'detected');
                }
            } else {
                this.updateFaceStatus('No face detected. Please position yourself in front of the camera.', 'not-detected');
            }
            
            // Draw face detection on canvas
            this.drawFaceDetection(detections);
            
        } catch (error) {
            console.log('Face detection error:', error);
        }
    }
    
    mapApiEmotionToGameEmotion(apiEmotion) {
        const emotionMap = {
            'happy': 'Happy',
            'sad': 'Sad',
            'angry': 'Angry',
            'fearful': 'Scared',
            'disgusted': 'Angry',
            'surprised': 'Surprised',
            'neutral': 'Neutral'
        };
        
        return emotionMap[apiEmotion] || 'Neutral';
    }
    
    checkFaceMatch() {
        if (this.currentEmotion && this.currentPlayerEmotion) {
            console.log('Checking match:', this.currentPlayerEmotion, 'vs', this.currentEmotion.word);
            if (this.currentPlayerEmotion === this.currentEmotion.word) {
                this.handleCorrectFaceMatch();
            }
        }
    }
    
    handleCorrectFaceMatch() {
        // Prevent multiple matches for the same emotion
        if (this.isGameActive && !this.isProcessingAnswer) {
            this.isProcessingAnswer = true;
            
            this.score += 15 * this.level; // Bonus points for face matching
            this.correctAnswers++;
            this.totalQuestions++;
            
            this.showFeedback(`Perfect! You matched ${this.currentEmotion.word} with your face! 🌟`, 'correct');
            this.playSound('correct');
            
            this.updateDisplay();
            this.updateProgress();
            
            setTimeout(() => {
                this.clearFeedback();
                this.generateNewQuestion();
                this.isProcessingAnswer = false;
            }, 2000);
        }
    }
    
    drawFaceDetection(detections) {
        if (!this.canvas || !this.isFaceApiLoaded) return;
        
        const displaySize = { width: 320, height: 240 };
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            // Draw face detection box
            resizedDetections.forEach(detection => {
                const box = detection.detection.box;
                ctx.strokeStyle = '#4facfe';
                ctx.lineWidth = 2;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Draw emotion label
                const expressions = detection.expressions;
                const emotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
                
                ctx.fillStyle = '#4facfe';
                ctx.font = '14px Comic Neue';
                ctx.fillText(`${emotion[0]} (${Math.round(emotion[1] * 100)}%)`, box.x, box.y - 5);
            });
        }
    }
    
    setupEventListeners() {
        // New game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.isGameActive = true;
        this.isProcessingAnswer = false;
        this.updateDisplay();
        this.generateNewQuestion();
        this.showFeedback('New game started!', 'neutral');
    }
    
    generateNewQuestion() {
        if (!this.isGameActive) return;
        
        // Select random emotion
        this.currentEmotion = this.emotions[Math.floor(Math.random() * this.emotions.length)];
        
        // Update main emotion display
        const mainEmotionFace = document.getElementById('main-emotion-face');
        if (mainEmotionFace) {
            mainEmotionFace.textContent = this.currentEmotion.emoji;
            mainEmotionFace.style.color = this.currentEmotion.color;
        }
        
        // Generate options
        this.generateOptions();
        
        // Update instruction
        const instruction = document.getElementById('emotion-instruction');
        if (instruction) {
            instruction.textContent = `Make this expression with your face or click the matching word below!`;
        }
    }
    
    generateOptions() {
        const optionsContainer = document.getElementById('options-container');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        // Create correct answer
        const correctOption = this.createOption(this.currentEmotion.word, true);
        optionsContainer.appendChild(correctOption);

        // Create incorrect options
        const incorrectEmotions = this.emotions.filter(emotion =>
            emotion.word !== this.currentEmotion.word
        );

        // Shuffle and take 3 random incorrect options
        const shuffled = this.shuffleArray(incorrectEmotions);
        const incorrectOptions = shuffled.slice(0, 3);

        incorrectOptions.forEach(emotion => {
            const option = this.createOption(emotion.word, false);
            optionsContainer.appendChild(option);
        });

        // Shuffle the options in the container
        this.shuffleOptions(optionsContainer);
    }

    createOption(word, isCorrect) {
        const emotion = this.emotions.find(e => e.word === word);
        const option = document.createElement('div');
        option.className = 'emotion-option';
        // Show emoji and word
        option.innerHTML = `<span style="font-size:2rem; margin-right:8px;">${emotion ? emotion.emoji : ''}</span> ${word}`;
        option.setAttribute('role', 'button');
        option.setAttribute('tabindex', '0');
        option.setAttribute('aria-label', `Select ${word} as the emotion`);

        // Add keyboard support
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleAnswer(option, isCorrect);
            }
        });

        option.addEventListener('click', () => {
            if (option.classList.contains('disabled')) return;
            this.handleAnswer(option, isCorrect);
        });

        return option;
    }
    
    handleAnswer(selectedOption, isCorrect) {
        // Disable all options
        const allOptions = document.querySelectorAll('.emotion-option');
        allOptions.forEach(option => {
            option.classList.add('disabled');
            option.setAttribute('aria-disabled', 'true');
        });
        
        this.totalQuestions++;
        
        if (isCorrect) {
            // Correct answer
            selectedOption.classList.add('correct');
            this.score += 10 * this.level;
            this.correctAnswers++;
            this.showFeedback(`Great job! That's correct! 🎉`, 'correct');
            this.playSound('correct');
        } else {
            // Incorrect answer
            selectedOption.classList.add('incorrect');
            
            // Highlight correct answer
            allOptions.forEach(option => {
                if (option.textContent === this.currentEmotion.word) {
                    option.classList.add('correct');
                }
            });
            
            this.showFeedback(`Great effort! The correct answer was ${this.currentEmotion.word.toLowerCase()}. Keep practicing and you'll get it!`, 'incorrect');
            this.playSound('incorrect');
        }
        
        this.updateDisplay();
        this.updateProgress();
        
        // Wait before next question
        setTimeout(() => {
            this.clearFeedback();
            this.generateNewQuestion();
        }, 2000);
    }
    
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback-message ${type}`;
        }
    }
    
    clearFeedback() {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback-message';
        }
    }
    
    updateDisplay() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.level;
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = (this.correctAnswers / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Level up every 5 correct answers
        if (this.correctAnswers > 0 && this.correctAnswers % 5 === 0) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.showFeedback(`Level ${this.level}! You're doing amazing! 🌟`, 'correct');
        this.updateDisplay();
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'correct') {
                // Happy ascending tone
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            } else {
                // Gentle descending tone for incorrect
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(493.88, audioContext.currentTime + 0.1); // B4
                oscillator.frequency.setValueAtTime(440.00, audioContext.currentTime + 0.2); // A4
            }
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    shuffleOptions(container) {
        const options = Array.from(container.children);
        const shuffled = this.shuffleArray(options);
        
        container.innerHTML = '';
        shuffled.forEach(option => container.appendChild(option));
    }
    
    showHelp() {
        const helpMessage = `
            <div class="help-content">
                <h3>How to Play Emotion Faces Match</h3>
                <h4>Face Recognition Mode:</h4>
                <ol>
                    <li>Click "Start Camera" to enable your webcam</li>
                    <li>Allow camera access when prompted</li>
                    <li>Look at the emotion face shown on screen</li>
                    <li>Make that same expression with your face!</li>
                    <li>The game will detect your expression and give you points</li>
                </ol>
                <h4>Card Mode:</h4>
                <ol>
                    <li>Look at the big emotion face at the top</li>
                    <li>Click on the matching emotion word below</li>
                    <li>Listen for the sound to know if you're right!</li>
                </ol>
                <p><strong>Tip:</strong> Face recognition gives bonus points! Try both modes!</p>
                <p><strong>Note:</strong> If face recognition doesn't work, you can still play with the emotion cards!</p>
            </div>
        `;
        
        this.showFeedback(helpMessage, 'help');
    }
    
    // Cleanup method
    cleanup() {
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }
        this.stopCamera();
    }
}

// Make the class available globally
window.EmotionMatchGame = EmotionMatchGame;