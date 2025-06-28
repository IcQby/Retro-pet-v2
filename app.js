const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

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

// Constants for pet size
const width = 102, height = 102;  // Actual image size (scaled down)
const groundY = canvas.height - height;  // Set ground to the bottom based on 102px image height

// Pet images
let petImgLeft = new Image();
petImgLeft.src = 'icon/icon-192.png';

let petImgSleep = new Image();
petImgSleep.src = 'icon/pig-sleep.png';  // New image for sleeping state

let petX = canvas.width - width - 10, petY = groundY; // inside canvas
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;

let sleeping = false;  // State to track if the pet is sleeping
let jumpInProgress = false;  // To track if a jump is currently in progress

// Function to start jumping
function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
  jumpInProgress = true;
}

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
  // Ensure pet is within bounds
  if (petX < 0) petX = 0;
  if (petX + width > canvas.width) petX = canvas.width - width;
  if (petY < 0) petY = 0;  // Prevent the pet from going above the canvas
  if (petY > canvas.height - height) petY = canvas.height - height;  // Prevent it from going below the canvas

  drawBackground();  // Draw the background first

  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame

  if (sleeping) {
    ctx.drawImage(petImgSleep, petX, petY, width, height);  // Show sleep image
    return;  // Stop further movement during sleep
  }

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

  // Check if the pig reaches the ground
  if (petY >= groundY) {
    petY = groundY;
    if (jumpInProgress && !sleeping) {
      jumpInProgress = false;
      // Start the sleep sequence after reaching the ground
      initiateSleepSequence();
    }
  }

  // Draw the pet image based on the current state
  if (facing === 1) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(petImgLeft, petX, petY, width, height);
  }

  requestAnimationFrame(animate);  // Continue animation loop
}

// Start animation once image is loaded
petImgLeft.onload = () => {
  petImgSleep.onload = () => {
    animate();  // Start animation only after both images are loaded
  };
};

// Sleep sequence function
function initiateSleepSequence() {
  // Stop movement temporarily for 1 second
  setTimeout(() => {
    // Switch to sleep icon
    sleeping = true;

    // Wait for 5 seconds while the pet is sleeping
    setTimeout(() => {
      // After 5 seconds, switch back to jumping
      sleeping = false;
      petY = groundY;  // Ensure the pet stays on the ground after waking up

      // Wait for 2 more seconds before jumping again
      setTimeout(() => {
        startJump();  // Start a new jump after the 2-second wait
      }, 2000);  // Wait 2 seconds before jumping
    }, 5000);  // Sleep for 5 seconds
  }, 1000);  // Pause for 1 second before switching to sleep
}

// Button to trigger sleep (simulate button click)
document.getElementById('sleepButton').addEventListener('click', () => {
  if (!sleeping) {
    jumpInProgress = false;  // Stop jumping when sleep is triggered
    petY = groundY;  // Ensure the pig is on the ground
    initiateSleepSequence();  // Start the sleep sequence
  }
});
