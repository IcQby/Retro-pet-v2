// --- Canvas and Pet Animation ---
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// --- Responsive Canvas ---
const PET_WIDTH = 102, PET_HEIGHT = 102;
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = 300;
  if (typeof petX !== 'undefined' && typeof petY !== 'undefined') {
    petX = Math.min(Math.max(petX, 0), canvas.width - PET_WIDTH - 10);
    petY = canvas.height - PET_HEIGHT;
  }
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', resizeCanvas);
resizeCanvas();

// --- Pet Images ---
let petImgLeft = new Image();
let petImgRight = new Image();
let petImgSleep = new Image();
let petImgSleepR = new Image();
petImgLeft.src = 'icon/pig-left.png';
petImgRight.src = 'icon/pig-right.png';
petImgSleep.src = 'icon/pig-sleep.png';
petImgSleepR.src = 'icon/pig-sleepR.png';

// --- Pet Animation State ---
let petX, petY;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1; // -1=left, 1=right
let isSleeping = false;
let sleepSequenceActive = false;
let sleepRequested = false;
let sleepSequenceStep = 0;
let currentImg = petImgLeft; // Track which image is currently shown
let resumeDirection = direction; // direction to restore after sleep
let resumeImg = currentImg;      // image to restore after sleep

// --- Stats Logic ---
let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

// --- Pet Care Functions ---
window.feedPet = function() {
  pet.hunger = Math.max(0, pet.hunger - 15);
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
  registerBackgroundSync('sync-feed-pet');
};
window.playWithPet = function() {
  pet.happiness = Math.min(100, pet.happiness + 10);
  pet.hunger = Math.min(100, pet.hunger + 5);
  updateStats();
};
window.cleanPet = function() {
  pet.cleanliness = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
};
window.sleepPet = function() {
  pet.health = Math.min(100, pet.health + 10);
  pet.hunger = Math.min(100, pet.hunger + 10);
  updateStats();
  // Only request sleep, do NOT start sequence yet
  // Only allow request if pig on ground and not at wall
  let groundY = canvas.height - PET_HEIGHT;
  const atWall = (petX <= 0) || (petX + PET_WIDTH >= canvas.width);
  if (!isSleeping && !sleepSequenceActive && !sleepRequested && petY >= groundY && !atWall) {
    sleepRequested = true;
    resumeDirection = direction;
    resumeImg = (direction === 1) ? petImgRight : petImgLeft;
  }
};
window.healPet = function() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
};

// --- Sleep Sequence Logic ---
function runSleepSequence() {
  sleepSequenceStep = 1;
  sleepSequenceActive = true;
  sleepRequested = false;

  let imgA = resumeImg;
  let imgB = (resumeImg === petImgRight) ? petImgLeft : petImgRight;
  let sleepImg = (resumeImg === petImgRight) ? petImgSleepR : petImgSleep;

  currentImg = imgA;
  vx = 0; vy = 0; // Stop pig immediately

  // Animation: 1s original, 0.5s opposite, 0.5s original, 0.5s opposite, then sleep for 5s, then wake up (2s original)
  setTimeout(() => {
    currentImg = imgB;
    setTimeout(() => {
      currentImg = imgA;
      setTimeout(() => {
        currentImg = imgB;
        setTimeout(() => {
          currentImg = sleepImg;
          isSleeping = true;
          sleepSequenceActive = false;
          // Sleep for 5 seconds
          setTimeout(() => {
            currentImg = imgA;
            isSleeping = false;
            setTimeout(() => {
              sleepSequenceStep = 0;
              sleepSequenceActive = false;
              direction = resumeDirection;
              currentImg = (direction === 1) ? petImgRight : petImgLeft;
              startJump();
            }, 2000);
          }, 5000);
        }, 500);
      }, 500);
    }, 500);
  }, 1000);
}

function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

// --- Background & Animation ---
function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!isSleeping && !sleepSequenceActive) {
    vy += gravity;
    petX += vx;
    petY += vy;
  }

  // Walls
  if (!isSleeping && !sleepSequenceActive) {
    if (petX <= 0) {
      petX = 0;
      direction = 1;
      vx = Math.abs(vx);
      currentImg = petImgRight;
    } else if (petX + PET_WIDTH >= canvas.width) {
      petX = canvas.width - PET_WIDTH;
      direction = -1;
      vx = -Math.abs(vx);
      currentImg = petImgLeft;
    }
  }

  // Ground
  let groundY = canvas.height - PET_HEIGHT;
  const atWall = (petX <= 0) || (petX + PET_WIDTH >= canvas.width);

  if (petY >= groundY) {
    petY = groundY;
    // Only start sleep sequence if not at a wall
    if (sleepRequested && !sleepSequenceActive && !atWall) {
      vx = 0; // Stop horizontal movement
      runSleepSequence();
    } else if (!isSleeping && !sleepSequenceActive && !sleepRequested) {
      startJump();
    }
  }

  // Draw pig
  ctx.drawImage(currentImg, petX, petY, PET_WIDTH, PET_HEIGHT);

  requestAnimationFrame(animate);
}

// --- Background Sync ---
function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register(tag).catch(() => {});
    });
  }
}

// --- Service Worker: Force Always Update and Reload Page ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(registration => {
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) window.location.reload();
          }
        });
      }
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
}

// --- Start Everything ---
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  updateStats();
  Promise.all([
    new Promise(resolve => petImgLeft.onload = resolve),
    new Promise(resolve => petImgRight.onload = resolve),
    new Promise(resolve => petImgSleep.onload = resolve),
    new Promise(resolve => petImgSleepR.onload = resolve)
  ]).then(() => {
    // Set initial position and image only after canvas has a width
    petX = canvas.width - PET_WIDTH - 10;
    petY = canvas.height - PET_HEIGHT;
    currentImg = petImgLeft;
    animate();
  });
});
