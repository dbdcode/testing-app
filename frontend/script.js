const video   = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx     = overlay.getContext('2d');

let model;
let lastChange = 0;

// Access the webcam and start detection
async function init() {
  await setupCamera();
  overlay.width  = video.videoWidth;
  overlay.height = video.videoHeight;

  model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  detectLoop();
}

// Request webcam stream
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false
  });
  video.srcObject = stream;
  return new Promise(res => (video.onloadedmetadata = res));
}

// Random HSL color helper
function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}

// Main detection loop
async function detectLoop() {
  const preds = await model.detect(video);
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  let personFound = false;
  preds.forEach(p => {
    if (p.class === 'person' && p.score > 0.6) {
      personFound = true;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(...p.bbox);
    }
  });

  // Change page background if a person is visible (debounced 500 ms)
  if (personFound) {
    const now = performance.now();
    if (now - lastChange > 500) {
      document.body.style.backgroundColor = randomColor();
      lastChange = now;
    }
  }

  requestAnimationFrame(detectLoop);
}

// Start everything
init();