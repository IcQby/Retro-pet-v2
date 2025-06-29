// ```javascript name=app.js
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Constants for pet size and scaling
const PET_ORIGINAL_SIZE = 204; // original image is 204x204
const width = 102, height = 102; // display size is 102x102

// Resize canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;  // Fixed height for the canvas (300 pixels)
}
resizeCanvas();

// Keep canvas resized when window is resized
window.addEventListener('resize', () => {
  resizeCanvas();
  // Keep pet inside canvas after resize
  if (petX + width > canvas.width) {
    petX = canvas.width - width;
  }
});

// Set ground to the bottom based on displayed image height
let groundY = canvas.height - height;

// Pet image
let petImgLeft = new window.Image();
petImgLeft.src = './icon/pig-left.png';

let petX = canvas.width - width - 10, petY = groundY; // inside canvas
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;

// Function to start jumping
function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

startJump();

// Draw background with pastel green (ground) and light blue (air)
function drawBackground() {
  // Ground (pastel green)
  ctx.fillStyle = '#90EE90';  // Pastel green color for the ground
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);

  // Air (light blue)
  ctx.fillStyle = '#ADD8E6';  // Light blue color for the sky
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

// Animation function
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame
  drawBackground();  // Draw the background first

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

  // Draw the pet image based on facing direction with flipping
  if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
    if (facing === 1) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        petImgLeft,
        0, 0, PET_ORIGINAL_SIZE, PET_ORIGINAL_SIZE, // source: top-left crop of the image
        -petX - width, petY, width, height           // destination: scaled to 102x102
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        petImgLeft,
        0, 0, PET_ORIGINAL_SIZE, PET_ORIGINAL_SIZE, // source: top-left crop of the image
        petX, petY, width, height                   // destination: scaled to 102x102
      );
    }
  }
  requestAnimationFrame(animate);  // Continue animation loop
}

// Start animation once image is loaded
petImgLeft.onload = () => {
  animate();
};
// In case the image is cached and already loaded
if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
  animate();
}

// --- Stats and interactions below (unchanged) ---

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

// Simulate pet stats decay over time
setInterval(() => {
  pet.happiness = clamp(pet.happiness - 1);
  pet.hunger = clamp(pet.hunger - 1);
  pet.cleanliness = clamp(pet.cleanliness - 1);
  pet.health = clamp(pet.health - (pet.hunger < 20 ? 2 : 0));
  updateStats();
}, 3000);

window.feedPet = feedPet;
window.playWithPet = playWithPet;
window.cleanPet = cleanPet;
window.sleepPet = sleepPet;
window.healPet = healPet;

updateStats();
```
