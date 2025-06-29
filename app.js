const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const PET_ORIGINAL_SIZE = 204;
const width = 102, height = 102;

let groundY;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;
  groundY = canvas.height - height;
  // Make sure pet stays inside after resize
  if (typeof petX !== 'undefined' && petX + width > canvas.width) {
    petX = canvas.width - width;
  }
  if (typeof petY !== 'undefined' && petY > groundY) {
    petY = groundY;
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Pet image
let petImgLeft = new window.Image();
petImgLeft.src = './icon/pig-left.png';

// Pet state
let petX = canvas.width - width - 10, petY = groundY;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;

// Jump logic
function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

// Draw background
function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

// Animation
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Gravity and movement
  vy += gravity;
  petX += vx;
  petY += vy;

  // Bounce off left wall
  if (petX <= 0) {
    petX = 0;
    direction = 1;
    facing = 1;
    vx = Math.abs(vx);
  }
  // Bounce off right wall
  else if (petX + width >= canvas.width) {
    petX = canvas.width - width;
    direction = -1;
    facing = -1;
    vx = -Math.abs(vx);
  }

  // Bounce off ground
  groundY = canvas.height - height;
  if (petY >= groundY) {
    petY = groundY;
    startJump();
  }

  // Draw the pet image
  if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
    if (facing === 1) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        petImgLeft,
        0, 0, PET_ORIGINAL_SIZE, PET_ORIGINAL_SIZE,
        -petX - width, petY, width, height
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        petImgLeft,
        0, 0, PET_ORIGINAL_SIZE, PET_ORIGINAL_SIZE,
        petX, petY, width, height
      );
    }
  }
  requestAnimationFrame(animate);
}

// --- Stats and interactions ---
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

function clamp(val) {
  return Math.max(0, Math.min(100, val));
}

function feedPet() {
  pet.hunger = clamp(pet.hunger + 15);
  pet.happiness = clamp(pet.happiness + 5);
  updateStats();
}
function playWithPet() {
  pet.happiness = clamp(pet.happiness + 15);
  pet.hunger = clamp(pet.hunger - 5);
  pet.cleanliness = clamp(pet.cleanliness - 5);
  updateStats();
}
function cleanPet() {
  pet.cleanliness = clamp(pet.cleanliness + 20);
  pet.happiness = clamp(pet.happiness + 2);
  updateStats();
}
function sleepPet() {
  pet.health = clamp(pet.health + 10);
  pet.happiness = clamp(pet.happiness + 3);
  pet.hunger = clamp(pet.hunger - 7);
  updateStats();
}
function healPet() {
  pet.health = clamp(pet.health + 25);
  pet.happiness = clamp(pet.happiness - 5);
  updateStats();
}

// Decay stats over time
setInterval(() => {
  pet.happiness = clamp(pet.happiness - 1);
  pet.hunger = clamp(pet.hunger - 1);
  pet.cleanliness = clamp(pet.cleanliness - 1);
  pet.health = clamp(pet.health - (pet.hunger < 20 ? 2 : 0));
  updateStats();
}, 3000);

// Expose functions for buttons
window.feedPet = feedPet;
window.playWithPet = playWithPet;
window.cleanPet = cleanPet;
window.sleepPet = sleepPet;
window.healPet = healPet;

// Start everything once image is loaded
petImgLeft.onload = () => {
  updateStats();
  startJump();
  animate();
};
// In case the image is cached and already loaded
if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
  updateStats();
  startJump();
  animate();
}
