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

// Initialize slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CinematicSlideshow();
});

// --- Original Page Navigation Logic ---
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const getStartedBtn = document.getElementById('getStartedBtn');

function showPage(pageId) {
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
}

navLinks.forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page));
});

getStartedBtn.addEventListener('click', () => showPage('tracker'));
showPage('home');

// Email Support Form Navigation
const emailSupportBtn = document.getElementById('emailSupportBtn');
const backToSupportBtn = document.getElementById('backToSupportBtn');
if (emailSupportBtn) emailSupportBtn.addEventListener('click', () => showPage('emailSupport'));
if (backToSupportBtn) backToSupportBtn.addEventListener('click', () => showPage('support'));

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
