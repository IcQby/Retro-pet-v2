const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;  // Fixed height for the canvas (300 pixels)
  console.log(`Canvas resized: Width: ${canvas.width}, Height: ${canvas.height}`);
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

// Constants for pet size
const width = 102, height = 102;  // Actual image size (scaled down)
const groundY = canvas.height - height ;  // Set ground to the bottom based on 102px image height

// Pet image
let petImgRight = new Image();
petImgRight.src = 'icon/pig-right.png';  // Path to pig-right.png image

// Check if the image loaded correctly
petImgRight.onload = () => {
  console.log('Pet image loaded successfully.');
  console.log(`Pet image dimensions: Width: ${petImgRight.width}, Height: ${petImgRight.height}`);
  animate();  // Start animation once image is loaded
};

petImgRight.onerror = () => {
  console.error('Failed to load pet image. Check the path.');
  // Use a fallback image if needed (you could also add a default image here)
};

// Initialize pet position
let petX = canvas.width - width - 10, petY = groundY; // inside canvas
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1;

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
  drawBackground();  // Draw the background first (not influenced by anything else)

  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame

  // Gravity and movement
  vy += gravity;
  petX += vx;
  petY += vy;

  console.log(`Pet coordinates: X: ${petX}, Y: ${petY}`);  // Log pet coordinates

  // Bounce off left wall
  if (petX <= 0) {
    petX = 0;
    direction = 1;
    vx = Math.abs(vx);
  }
  // Bounce off right wall
  else if (petX + width >= canvas.width) {
    petX = canvas.width - width;
    direction = -1;
    vx = -Math.abs(vx);
  }

  // Bounce off ground
  if (petY >= groundY) {
    petY = groundY;
    startJump();
  }

  // Draw the pet image (without flipping, always facing right)
  ctx.drawImage(petImgRight, petX, petY, width, height);

  requestAnimationFrame(animate);  // Continue animation loop
}

// --- Stats and interactions below (unchanged) ---

let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

function updateStats() {
  // Debugging stats
  console.log('Updating stats:', pet);

  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

function feedPet() {
  pet.hunger = Math.max(0, pet.hunger - 15);
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
  registerBackgroundSync('sync-feed-pet');
}

function playWithPet() {
  pet.happiness = Math.min(100, pet.happiness + 10);
  pet.hunger = Math.min(100, pet.hunger + 5);
  updateStats();
}

function cleanPet() {
  pet.cleanliness = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

function sleepPet() {
  pet.health = Math.min(100, pet.health + 10);
  pet.hunger = Math.min(100, pet.hunger + 10);
  updateStats();
}

function healPet() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

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

window.onload = () => {
  updateStats();
};
