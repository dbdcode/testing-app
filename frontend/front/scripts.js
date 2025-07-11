// Cinematic Slideshow Controller
class CinematicSlideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slideshow-slide');
        this.currentSlide = 0;
        this.slideInterval = 3000; // 3 seconds per slide
        this.isTransitioning = false;
        
        // Preload images for smooth transitions
        this.preloadImages();
        
        // Start slideshow
        this.start();
    }
    
    preloadImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }
    
    start() {
        // Show first slide immediately
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
            
            // Start automatic slideshow
            setInterval(() => {
                this.nextSlide();
            }, this.slideInterval);
        }
    }
    
    nextSlide() {
        if (this.isTransitioning || this.slides.length <= 1) return;
        
        this.isTransitioning = true;
        
        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        
        // Calculate next slide index
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        
        // Add active class to next slide
        setTimeout(() => {
            this.slides[this.currentSlide].classList.add('active');
            this.isTransitioning = false;
        }, 100);
    }
}

// Virtual Demo Controller removed
class VirtualDemoController {
    constructor() {
        this.isRunning = false;
        this.currentScenario = null;
        this.startTime = null;
        this.timer = null;
        this.currentStep = 0;
        
        this.scenarios = {
            before: {
                name: 'Manual Process',
                steps: [
                    { name: 'Patient Arrival', duration: 2000, action: 'Patient enters clinic' },
                    { name: 'Queue Waiting', duration: 3000, action: 'Waiting in line' },
                    { name: 'Reception Desk', duration: 4000, action: 'Manual form filling' },
                    { name: 'ID Verification', duration: 3000, action: 'Staff checks documents' },
                    { name: 'System Entry', duration: 4000, action: 'Data entry to system' },
                    { name: 'Paper Filing', duration: 2000, action: 'Physical record update' },
                    { name: 'Treatment Assignment', duration: 3000, action: 'Manual room assignment' },
                    { name: 'Patient Direction', duration: 2000, action: 'Staff guides patient' }
                ],
                totalTime: 23000
            },
            after: {
                name: 'AI-Powered Process',
                steps: [
                    { name: 'Smart Entry', duration: 500, action: 'AI detects patient' },
                    { name: 'Instant Recognition', duration: 1000, action: 'Face ID verification' },
                    { name: 'Auto Check-in', duration: 500, action: 'System updates instantly' },
                    { name: 'Smart Routing', duration: 500, action: 'AI assigns optimal room' },
                    { name: 'Patient Notification', duration: 500, action: 'Digital guidance sent' }
                ],
                totalTime: 3000
            }
        };
        
        this.initializeElements();
        this.attachEventListeners();
    }
    
    initializeElements() {
        this.elements = {
            startDemoBtn: document.getElementById('startDemoBtn'),
            resetDemoBtn: document.getElementById('resetDemoBtn'),
            beforeScenarioBtn: document.getElementById('beforeScenarioBtn'),
            afterScenarioBtn: document.getElementById('afterScenarioBtn'),
            scenarioSelector: document.querySelector('.scenario-selector'),
            virtualPatient: document.getElementById('virtualPatient'),
            deskDisplay: document.getElementById('deskDisplay'),
            actionText: document.getElementById('actionText'),
            timeline: document.getElementById('timeline'),
            timeElapsed: document.getElementById('timeElapsed'),
            stepsCompleted: document.getElementById('stepsCompleted'),
            comparisonResults: document.getElementById('comparisonResults'),
            manualTime: document.getElementById('manualTime'),
            aiTime: document.getElementById('aiTime'),
            timeSaved: document.getElementById('timeSaved')
        };
    }
    
    attachEventListeners() {
        this.elements.startDemoBtn.addEventListener('click', () => this.startDemo());
        this.elements.resetDemoBtn.addEventListener('click', () => this.resetDemo());
        this.elements.beforeScenarioBtn.addEventListener('click', () => this.runScenario('before'));
        this.elements.afterScenarioBtn.addEventListener('click', () => this.runScenario('after'));
    }
    
    startDemo() {
        this.elements.startDemoBtn.classList.add('hidden');
        this.elements.resetDemoBtn.classList.remove('hidden');
        this.elements.scenarioSelector.classList.remove('hidden');
        this.elements.virtualPatient.classList.remove('hidden');
        
        // Clear any previous results
        this.elements.comparisonResults.classList.add('hidden');
    }
    
    resetDemo() {
        this.stopScenario();
        this.elements.startDemoBtn.classList.remove('hidden');
        this.elements.resetDemoBtn.classList.add('hidden');
        this.elements.scenarioSelector.classList.add('hidden');
        this.elements.virtualPatient.classList.add('hidden');
        this.elements.comparisonResults.classList.add('hidden');
        
        // Reset displays
        this.elements.deskDisplay.innerHTML = '<p class="animate-typewriter">Reception System Ready...</p>';
        this.elements.actionText.textContent = 'Waiting...';
        this.clearTimeline();
    }
    
    runScenario(type) {
        if (this.isRunning) return;
        
        this.currentScenario = this.scenarios[type];
        this.currentStep = 0;
        this.isRunning = true;
        this.startTime = Date.now();
        
        // Update button states
        document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
        if (type === 'before') {
            this.elements.beforeScenarioBtn.classList.add('active');
        } else {
            this.elements.afterScenarioBtn.classList.add('active');
        }
        
        // Setup timeline
        this.setupTimeline();
        
        // Start the scenario
        this.processNextStep();
        
        // Start timer
        this.startTimer();
    }
    
    setupTimeline() {
        const stepsContainer = this.elements.timeline.querySelector('.timeline-steps');
        stepsContainer.innerHTML = '';
        
        this.currentScenario.steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'timeline-step';
            stepElement.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <span class="font-medium">${step.name}</span>
                    <span class="text-sm text-gray-400">${(step.duration / 1000).toFixed(1)}s</span>
                </div>
            `;
            stepElement.dataset.stepIndex = index;
            stepsContainer.appendChild(stepElement);
        });
        
        // Update steps counter
        this.elements.stepsCompleted.textContent = `0/${this.currentScenario.steps.length}`;
    }
    
    processNextStep() {
        if (!this.isRunning || this.currentStep >= this.currentScenario.steps.length) {
            this.completeScenario();
            return;
        }
        
        const step = this.currentScenario.steps[this.currentStep];
        const stepElements = this.elements.timeline.querySelectorAll('.timeline-step');
        
        // Update timeline visual
        stepElements.forEach((el, index) => {
            if (index < this.currentStep) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (index === this.currentStep) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('completed', 'active');
            }
        });
        
        // Update displays
        this.elements.deskDisplay.innerHTML = `<p class="text-green-400">Processing: ${step.name}</p>`;
        this.elements.actionText.textContent = step.action;
        
        // Update progress
        const progress = ((this.currentStep + 1) / this.currentScenario.steps.length) * 100;
        this.elements.timeline.querySelector('.timeline-progress').style.width = `${progress}%`;
        this.elements.stepsCompleted.textContent = `${this.currentStep + 1}/${this.currentScenario.steps.length}`;
        
        // Animate patient avatar
        this.animatePatient();
        
        // Schedule next step
        setTimeout(() => {
            this.currentStep++;
            this.processNextStep();
        }, step.duration);
    }
    
    animatePatient() {
        const avatar = this.elements.virtualPatient.querySelector('svg');
        avatar.style.transform = 'scale(1.1)';
        setTimeout(() => {
            avatar.style.transform = 'scale(1)';
        }, 300);
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.isRunning) return;
            
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.elements.timeElapsed.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 100);
    }
    
    stopScenario() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.elements.timeElapsed.textContent = '0:00';
    }
    
    completeScenario() {
        this.stopScenario();
        
        // Mark all steps as completed
        this.elements.timeline.querySelectorAll('.timeline-step').forEach(el => {
            el.classList.add('completed');
            el.classList.remove('active');
        });
        
        // Update displays
        this.elements.deskDisplay.innerHTML = '<p class="text-green-400">Process Complete!</p>';
        this.elements.actionText.textContent = 'Completed';
        
        // Store completion time
        const elapsed = Date.now() - this.startTime;
        if (this.currentScenario === this.scenarios.before) {
            this.manualProcessTime = elapsed;
            this.elements.manualTime.textContent = this.formatTime(elapsed);
        } else {
            this.aiProcessTime = elapsed;
            this.elements.aiTime.textContent = this.formatTime(elapsed);
        }
        
        // Show comparison if both scenarios completed
        if (this.manualProcessTime && this.aiProcessTime) {
            this.showComparison();
        }
    }
    
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    showComparison() {
        this.elements.comparisonResults.classList.remove('hidden');
        
        const saved = this.manualProcessTime - this.aiProcessTime;
        const savedMinutes = Math.floor(saved / 60000);
        const savedSeconds = Math.floor((saved % 60000) / 1000);
        
        this.elements.timeSaved.textContent = `${savedMinutes}:${savedSeconds.toString().padStart(2, '0')}`;
        
        // Animate the results
        this.elements.comparisonResults.style.opacity = '0';
        setTimeout(() => {
            this.elements.comparisonResults.style.opacity = '1';
        }, 100);
    }
    
    clearTimeline() {
        this.elements.timeline.querySelector('.timeline-steps').innerHTML = '';
        this.elements.timeline.querySelector('.timeline-progress').style.width = '0%';
        this.elements.timeElapsed.textContent = '0:00';
        this.elements.stepsCompleted.textContent = '0/0';
        this.manualProcessTime = null;
        this.aiProcessTime = null;
    }
}

// Initialize slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect on hero video section
    const hero = document.querySelector('.hero-section');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            hero.style.backgroundPosition = `${50 + (x - 0.5) * 4}% ${50 + (y - 0.5) * 4}%`;
        });
        hero.addEventListener('mouseleave', () => {
            hero.style.backgroundPosition = '50% 50%';
        });
    }
    
    // Header transparency effect on scroll
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Initial check and add scroll listener
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    new CinematicSlideshow();
    
});

// --- Original Page Navigation Logic ---
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const getStartedBtn = document.getElementById('getStartedBtn');
const tryDemoBtn = document.getElementById('tryDemoBtn');

function showPage(pageId) {
    const slideshow = document.getElementById('slideshow-container');
    if (document.getElementById('tracker').classList.contains('active') && pageId !== 'tracker') {
        stopTracking();
    }
    pages.forEach(page => {
        page.classList.toggle('active', page.id === pageId);
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    window.scrollTo(0, 0);
    // Toggle slideshow visibility based on tracker page
    if (pageId === 'tracker') {
        slideshow.classList.add('hidden');
    } else {
        slideshow.classList.remove('hidden');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page));
});

if (getStartedBtn) getStartedBtn.addEventListener('click', () => showPage('tracker'));

showPage('home');

// Email Support Form Navigation
const emailSupportBtn = document.getElementById('emailSupportBtn');
const backToSupportBtn = document.getElementById('backToSupportBtn');
if (emailSupportBtn) emailSupportBtn.addEventListener('click', () => showPage('emailSupport'));
if (backToSupportBtn) backToSupportBtn.addEventListener('click', () => showPage('support'));

// --- Demo Form Navigation & Handling ---
const backToHomeBtn = document.getElementById('backToHomeBtn');
if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => showPage('home'));

const demoForm = document.getElementById('demoForm');
if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('demoFullName').value.trim();
        const email = document.getElementById('demoEmail').value.trim();
        const business = document.getElementById('demoBusiness').value.trim();

        if (!fullName || !email || !business) {
            alert('Please fill in all required fields.');
            return;
        }

        // For now, simply log. Replace with API call / backend integration.
        console.log('Demo Request:', { fullName, email, business });
        alert('Thank you! Our team will reach out shortly to schedule your demo.');
        demoForm.reset();
        showPage('home');
    });
}

// --- Original Tracking Logic ---
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const loadingElement = document.getElementById('loading');
const inputTextBox = document.getElementById('inputTextBox');
let camera = null;
let pose = null;
let displayText = '';
let actionSequence = null;
let currentStepIndex = 0;

const landmarkNames = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow',
    'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index', 'right_index',
    'left_thumb', 'right_thumb', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
    'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'
];

function checkCondition(condition, landmarks) {
    const l1 = landmarks[landmarkNames.indexOf(condition.landmark1)];
    const l2 = landmarks[landmarkNames.indexOf(condition.landmark2)];
    if (!l1 || !l2) return false;
    const threshold = condition.threshold || 0.05;
    switch (condition.relationship) {
        case 'is_above': return l1.y < l2.y;
        case 'is_below': return l1.y > l2.y;
        case 'is_left_of': return l1.x < l2.x;
        case 'is_right_of': return l1.x > l2.x;
        case 'is_close_to': {
            const dx = l1.x - l2.x;
            const dy = l1.y - l2.y;
            return Math.sqrt(dx * dx + dy * dy) < threshold;
        }
        default: return false;
    }
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.poseLandmarks) {
        if (actionSequence && actionSequence.steps[currentStepIndex]) {
            const currentStep = actionSequence.steps[currentStepIndex];
            let allConditionsMet = true;
            for (const condition of currentStep.conditions) {
                if (!checkCondition(condition, results.poseLandmarks)) {
                    allConditionsMet = false;
                    break;
                }
            }
            if (allConditionsMet) {
                currentStepIndex++;
                if (currentStepIndex >= actionSequence.steps.length) {
                    displayText = `${actionSequence.actionName} Complete!`;
                    actionSequence = null;
                    currentStepIndex = 0;
                    setTimeout(() => { displayText = ''; }, 2000);
                } else {
                    displayText = actionSequence.steps[currentStepIndex].instruction;
                }
            }
        }
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', radius: 2 });
    }
    if (displayText) {
        canvasCtx.fillStyle = 'white';
        canvasCtx.strokeStyle = 'black';
        canvasCtx.lineWidth = 5;
        canvasCtx.font = 'bold 60px Inter';
        canvasCtx.textAlign = 'center';
        const x = canvasElement.width / 2;
        const y = canvasElement.height - 60;
        canvasCtx.strokeText(displayText, x, y);
        canvasCtx.fillText(displayText, x, y);
    }
    canvasCtx.restore();
}

function initializePose() {
    pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    pose.onResults(onResults);
}

async function startTracking() {
    loadingElement.classList.remove('hidden');
    startButton.disabled = true;
    if (!pose) initializePose();
    camera = new Camera(videoElement, { onFrame: async () => await pose.send({ image: videoElement }), width: 1280, height: 720 });
    try {
        await camera.start();
        loadingElement.classList.add('hidden');
        stopButton.disabled = false;
    } catch (error) {
        console.error("Failed to start camera:", error);
        loadingElement.classList.add('hidden');
        startButton.disabled = false;
    }
}

function stopTracking() {
    if (camera) { camera.stop(); camera = null; }
    displayText = '';
    actionSequence = null;
    currentStepIndex = 0;
    if(canvasCtx) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    startButton.disabled = false;
    stopButton.disabled = true;
}

async function getActionSequenceFromAI(command) {
    displayText = 'Analyzing action...';
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `\n                You are a virtual fitness coach. Your task is to take a user's command and break it down into a sequence of simple, checkable body poses.\n                Respond with ONLY a JSON object that follows this exact schema. Do not include any other text or markdown.\n\n                The user wants to perform the action: "${command}"\n\n                The available landmarks are: ${landmarkNames.join(', ')}.\n                The available relationships are: 'is_above', 'is_below', 'is_left_of', 'is_right_of', 'is_close_to'.\n\n                The JSON response must have an "actionName", and a "steps" array. Each step must have a "name", an "instruction" for the user, and an array of "conditions".\n                Each condition must have a "landmark1", a "landmark2", and a "relationship". For 'is_close_to', you can optionally add a "threshold" (0.0 to 1.0, default is 0.05).\n                Keep the instructions short and clear. Make the sequence logical for performing the action.\n            `;
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    };
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            const jsonText = result.candidates[0].content.parts[0].text;
            return JSON.parse(jsonText);
        } else {
            throw new Error("Invalid response structure from AI.");
        }
    } catch (error) {
        console.error("Error fetching from AI:", error);
        displayText = "Sorry, I couldn't understand that action.";
        setTimeout(() => { displayText = ''; }, 3000);
        return null;
    }
}

startButton.addEventListener('click', startTracking);
stopButton.addEventListener('click', stopTracking);
inputTextBox.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const command = inputTextBox.value.trim();
        if (command === '') return;
        inputTextBox.value = '';
        stopTracking();
        await startTracking();
        actionSequence = await getActionSequenceFromAI(command);
        if (actionSequence && actionSequence.steps && actionSequence.steps.length > 0) {
            currentStepIndex = 0;
            displayText = actionSequence.steps[0].instruction;
        }
    }
});

window.addEventListener('beforeunload', () => { if (camera) camera.stop(); });
