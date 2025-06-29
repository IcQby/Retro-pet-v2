// Get canvas and context
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Stat points example
let statPoints = {
  hunger: 5,
  happiness: 7,
  energy: 8
};

// Function to display stat points on screen
function drawStats() {
  // Clear only the stats area (top of canvas)
  ctx.clearRect(0, 0, canvas.width, 50);

  ctx.font = "20px monospace";
  ctx.fillStyle = "#0f0";
  ctx.textAlign = "left";
  ctx.fillText(`Hunger: ${statPoints.hunger}`, 16, 28);
  ctx.fillText(`Happiness: ${statPoints.happiness}`, 156, 28);
  ctx.fillText(`Energy: ${statPoints.energy}`, 336, 28);
}

// Initial call to draw stats
drawStats();
