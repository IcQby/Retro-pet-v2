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

// --- Pet Image ---
const width = 102, height = 102;
let petImgLeft = new Image();
petImgLeft.src = 'icon/pig-left.png';

// --- Pet Animation State ---
let petX = canvas.width - width - 10;
let petY = canvas.height - height;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;

function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}
startJump();

function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Gravity and movement
  vy += gravity;
  petX += vx;
  petY += vy;

  // Walls
  if (petX <= 0) {
    petX = 0;
    direction = 1;
    facing = 1;
    vx = Math.abs(vx);
  } else if (petX + width >= canvas.width) {
    petX = canvas.width - width;
    direction = -1;
    facing = -1;
    vx = -Math.abs(vx);
  }

  // Ground
  let groundY = canvas.height - height;
  if (petY >= groundY) {
    petY = groundY;
    startJump();
  }

  // Draw pig
  if (facing === 1) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(petImgLeft, petX, petY, width, height);
  }
  requestAnimationFrame(animate);
}

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
};
window.healPet = function() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
};

// --- Start Everything ---
petImgLeft.onload = animate;
window.addEventListener('DOMContentLoaded', () => {
  updateStats();
});
