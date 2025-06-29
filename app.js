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
const groundY = canvas.height - height ;  // Set ground to the bottom based on 102px image height

// Pet image
let petImgLeft = new window.Image(); // Ensure using window.Image for compatibility
petImgLeft.src = './icon/pig-left.png'; // Use a relative path with './' for reliability

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
  if (petY >= groundY) {
    petY = groundY;
    startJump();
  }

  // Draw the pet image based on facing direction with flipping
  if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) { // Only attempt to draw if loaded
    if (facing === 1) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(petImgLeft, petX, petY, width, height);
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
  // ...rest of your code
};
