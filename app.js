const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

let statPoints = {
  hunger: 5,
  happiness: 7,
  energy: 8
};

const pigRight = new Image();
pigRight.src = "icon/pig-right.png";

function drawStats() {
  ctx.font = "20px monospace";
  ctx.fillStyle = "#0f0";
  ctx.textAlign = "left";
  ctx.fillText(`Hunger: ${statPoints.hunger}`, 16, 28);
  ctx.fillText(`Happiness: ${statPoints.happiness}`, 156, 28);
  ctx.fillText(`Energy: ${statPoints.energy}`, 336, 28);
}

function drawPet() {
  // Draw pig lower down the canvas
  if (pigRight.complete) {
    ctx.drawImage(pigRight, canvas.width/2 - pigRight.width/2, 100);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStats();
  drawPet();
}

// Ensure pig image is loaded before drawing
pigRight.onload = draw;
window.onload = draw;
