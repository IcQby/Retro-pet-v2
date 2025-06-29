// --- Canvas and Pet Animation ---
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// --- Responsive Canvas ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Pet Images ---
const width = 102, height = 102;
const petImgLeft = new Image();
const petImgRight = new Image();
const petImgSleep = new Image();
petImgLeft.src = 'icon/pig-left.png';
petImgRight.src = 'icon/pig-right.png';
petImgSleep.src = 'icon/pig-sleep.png';

// --- Pet Animation State ---
let petX, petY;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1; // -1=left, 1=right
let isSleeping = false;
let sleepSequenceActive = false;
let sleepRequested = false;
let sleepSequenceTimer = null;
let currentImg;
let sleepResumeDirection = direction;
let sleepResumeImg;

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
  if (!isSleeping && !sleepSequenceActive && !sleepRequested) {
    sleepRequested = true;
    sleepResumeDirection = direction;
    sleepResumeImg = (direction === 1) ? petImgRight : petImgLeft;
  }
};
window.healPet = function() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
};

// --- Sleep Sequence Logic (as specified) ---
function runSleepSequence() {
  sleepSequenceActive = true;
  sleepRequested = false;
  vx = 0; vy = 0;

  // 1. Stay still for 1s (facing direction at time of sleep press)
  let originalImg = sleepResumeImg;
  let oppositeImg = (sleepResumeImg === petImgRight) ? petImgLeft : petImgRight;
  currentImg = originalImg;

  setTimeout(() => {
    // 2. Switch to opposite image
    currentImg = oppositeImg;
    setTimeout(() => {
      // 3. Switch back to original
      currentImg = originalImg;
      setTimeout(() => {
        // 4. Switch to opposite again
        currentImg = oppositeImg;
        setTimeout(() => {
          // 5. Switch to sleep image for 5s
          currentImg = petImgSleep;
          isSleeping = true;
          sleepSequenceActive = false;
          setTimeout(() => {
            // 6. For 2s, switch to the image pig was facing/going when sleep was pressed
            currentImg = originalImg;
            isSleeping = false;
            sleepSequenceActive = true; // Prevent movement for 2s
            setTimeout(() => {
              // 7. Resume jumping in the original direction
              sleepSequenceActive = false;
              direction = sleepResumeDirection;
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
    } else if (petX + width >= canvas.width) {
      petX = canvas.width - width;
      direction = -1;
      vx = -Math.abs(vx);
      currentImg = petImgLeft;
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

  ctx.drawImage(currentImg, petX, petY, width, height);
  requestAnimationFrame(animate);
}

// --- Background Sync & Push ---
function registerBackgroundSync(tag) {
  // (No-op for demo)
}

// --- Start Everything ---
let imagesLoaded = 0;
function onImgLoad() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    petX = canvas.width - width - 10;
    petY = canvas.height - height;
    direction = -1;
    currentImg = petImgLeft;
    updateStats();
    animate();
  }
}
petImgLeft.onload = onImgLoad;
petImgRight.onload = onImgLoad;
petImgSleep.onload = onImgLoad;

window.addEventListener('DOMContentLoaded', () => {
  updateStats();
});
