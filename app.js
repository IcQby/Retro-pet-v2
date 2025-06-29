// app.js

// Get the canvas and context
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Images for pig facing left and right
const pigLeftImg = new Image();
const pigRightImg = new Image();
pigLeftImg.src = 'pig-left.png';
pigRightImg.src = 'pig-right.png';

// Pig state
let pig = {
  x: 50,
  y: 200,
  width: 64,
  height: 64,
  vx: 2,   // horizontal speed
  vy: 0,   // vertical speed (for jump)
  gravity: 0.8,
  jumpStrength: -10,
  direction: 'right', // 'left' or 'right'
  jumping: false,
  jumpTimer: 0
};

const jumpInterval = 60; // frames between jumps
const jumpDuration = 30; // frames jump lasts

// Wait for images to load before starting animation
let imagesLoaded = 0;
pigLeftImg.onload = pigRightImg.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    requestAnimationFrame(loop);
  }
};

function jump() {
  if (!pig.jumping) {
    pig.jumping = true;
    pig.vy = pig.jumpStrength;
    pig.jumpTimer = 0;
  }
}

function update() {
  // Horizontal movement
  pig.x += pig.vx;

  // Jump logic
  if (!pig.jumping && Math.floor(Math.random() * jumpInterval) === 0) {
    jump();
  }
  if (pig.jumping) {
    pig.vy += pig.gravity;
    pig.y += pig.vy;
    pig.jumpTimer++;
    // End jump after jumpDuration frames or landing
    if (pig.jumpTimer > jumpDuration || pig.y > 200) {
      pig.y = 200;
      pig.vy = 0;
      pig.jumping = false;
    }
  }

  // Bounce off walls and change direction/image
  if (pig.x <= 0) {
    pig.x = 0;
    pig.vx = Math.abs(pig.vx);
    pig.direction = 'right';
  }
  if (pig.x + pig.width >= canvas.width) {
    pig.x = canvas.width - pig.width;
    pig.vx = -Math.abs(pig.vx);
    pig.direction = 'left';
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pig.direction === 'right') {
    ctx.drawImage(pigRightImg, pig.x, pig.y, pig.width, pig.height);
  } else {
    ctx.drawImage(pigLeftImg, pig.x, pig.y, pig.width, pig.height);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
