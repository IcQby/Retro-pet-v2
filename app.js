// --- Canvas and Pet Animation ---
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// --- Responsive Canvas ---
const CANVAS_HEIGHT = 300;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = CANVAS_HEIGHT;
  // If the pet already exists, keep it on the ground at the right
  if (typeof petX !== 'undefined' && typeof petY !== 'undefined') {
    petX = Math.min(petX, canvas.width - width - 10);
    petY = canvas.height - height;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Pet Images ---
const width = 102, height = 102;
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
let sleepSequenceTimer = null;
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
  if (document.getElementById('happiness'))
    document.getElementById('happiness').textContent = pet.happiness;
  if (document.getElementById('hunger'))
    document.getElementById('hunger').textContent = pet.hunger;
  if (document.getElementById('cleanliness'))
    document.getElementById('cleanliness').textContent = pet.cleanliness;
  if (document.getElementById('health'))
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
  if (!isSleeping && !sleepSequenceActive && !sleepRequested) {
    sleepRequested = true;
    // Save direction and image to restore after sleep
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
  sleepRequested = false; // reset request

  // Use the direction and image at the time sleep was pressed
  let imgA = resumeImg;
  let imgB = (resumeImg === petImgRight) ? petImgLeft : petImgRight;
  // Choose the correct sleep image for direction
  let sleepImg = (resumeImg === petImgRight) ? petImgSleepR : petImgSleep;

  currentImg = imgA;
  vx = 0; vy = 0; // Stop the pig

  // Fall asleep animation: 1s original, 0.5s opposite, 0.5s original, 0.5s opposite, then sleep for 5s, then wake up (2s original)
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
            // Wake up: show original facing for 2s, then jump
            currentImg = imgA;
            isSleeping = false;
            // Hold still for 2 seconds before jumping
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
      currentImg = petImgRight; // Always face right at left edge
    } else if (petX + width >= canvas.width) {
      petX = canvas.width - width;
      direction = -1;
      vx = -Math.abs(vx);
      currentImg = petImgLeft; // Always face left at right edge
    }
  }

  // Ground
  let groundY = canvas.height - height;
  if (petY >= groundY) {
    petY = groundY;
    if (sleepRequested && !sleepSequenceActive) {
      runSleepSequence();
    } else if (!isSleeping && !sleepSequenceActive && !sleepRequested) {
      startJump();
    }
  }

  // Draw pig
  ctx.drawImage(currentImg, petX, petY, width, height);

  requestAnimationFrame(animate);
}

// --- Background Sync ---
function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register(tag).then(() => {
        console.log(`Background sync registered for ${tag}`);
      }).catch(err => {
        console.log('Background sync registration failed:', err);
      });
    });
  }
}

// --- Service Worker: Force Always Update and Reload Page ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(registration => {
    // If a waiting service worker exists, make it activate immediately
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Listen for updates to the service worker and force reload
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available, reload to get the new service worker
              window.location.reload();
            }
          }
        });
      }
    });
  });
  // Listen for controlling service worker changing and reload page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// --- Start Everything ---
// Wait for all pet images to load before starting animation and setting up pet position
Promise.all([
  new Promise(resolve => petImgLeft.onload = resolve),
  new Promise(resolve => petImgRight.onload = resolve),
  new Promise(resolve => petImgSleep.onload = resolve),
  new Promise(resolve => petImgSleepR.onload = resolve)
]).then(() => {
  // Set initial position and image
  petX = canvas.width - width - 10;
  petY = canvas.height - height;
  currentImg = petImgLeft; // Start facing left
  updateStats(); // Show stats at startup
  animate();
});

window.addEventListener('DOMContentLoaded', () => {
  updateStats();
});
