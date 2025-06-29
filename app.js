// Get canvas and context
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Make sure canvas buffer matches CSS size for sharp rendering
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = 300; // matches the CSS height
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Image assets
const pigLeft = new Image();
pigLeft.src = "icon/pig-left.png";

const pigRight = new Image();
pigRight.src = "icon/pig-right.png";

// Pet state
let pet = {
  x: 150,
  y: 200,
  direction: "right", // "left" or "right"
  mood: "happy"
};

// Draw the pig
function drawPet() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Optionally, re-draw the background here if your canvas background is JS-drawn.
  // But if you're using CSS background, you don't need to.

  // Draw pig
  if (pet.direction === "left" && pigLeft.complete) {
    ctx.drawImage(
      pigLeft,
      pet.x - pigLeft.width / 2,
      pet.y - pigLeft.height / 2
    );
  } else if (pet.direction === "right" && pigRight.complete) {
    ctx.drawImage(
      pigRight,
      pet.x - pigRight.width / 2,
      pet.y - pigRight.height / 2
    );
  }
}

// Redraw when image is loaded
pigLeft.onload = pigRight.onload = drawPet;

// Controls
document.getElementById("left-btn").onclick = function() {
  pet.direction = "left";
  pet.x = Math.max(pet.x - 20, pigLeft.width / 2);
  drawPet();
};
document.getElementById("right-btn").onclick = function() {
  pet.direction = "right";
  pet.x = Math.min(
    pet.x + 20,
    canvas.width - pigRight.width / 2
  );
  drawPet();
};

// Initial draw (in case images are cached)
window.onload = () => {
  drawPet();
};

// Optionally, handle window resize to redraw pet at correct position
window.addEventListener('resize', () => {
  resizeCanvas();
  drawPet();
});
