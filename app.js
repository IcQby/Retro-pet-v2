const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Constants for pet size and scaling
const PET_ORIGINAL_SIZE = 204; // original image size (204x204)
const width = 102, height = 102; // display size

// Resize canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Pet image
const petImgLeft = new window.Image();
petImgLeft.src = './icon/pig-left.png';

// Draw background with pastel green (ground) and light blue (air)
function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);

  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

// Draw the pet centered horizontally and on the ground
function drawPet() {
  const x = (canvas.width - width) / 2;
  const y = canvas.height - height;
  // Draw only if image is loaded
  if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
    ctx.drawImage(
      petImgLeft,
      0, 0, PET_ORIGINAL_SIZE, PET_ORIGINAL_SIZE, // source: full img
      x, y, width, height // destination: scaled
    );
  }
}

// Draw everything once image is loaded
petImgLeft.onload = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPet();
};
// In case image is cached and already loaded
if (petImgLeft.complete && petImgLeft.naturalWidth !== 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPet();
}

// Optionally, redraw on resize so image stays centered
window.addEventListener('resize', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPet();
});
