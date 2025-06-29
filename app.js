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
let petImgLeft = new Image();
petImgLeft.src = 'icon/pig-left.png';
let petImgRight = new Image();
petImgRight.src = 'icon/pig-right.png';
let petImgSleep = new Image();
petImgSleep.src = 'icon/pig-sleep.png';

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
  currentImg = imgA;
  vx = 0; vy = 0; // Stop the pig

  // Fall asleep animation: 1s original, 0.5s opposite, 0.5s original, 0.5s opposite, then sleep for 5s, then wake up (2s original)
  setTimeout(() => {
    currentImg = imgB;
    setTimeout(() => {
      currentImg
