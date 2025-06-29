document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pet-canvas');
  const ctx = canvas.getContext('2d');

  // Constants for pet size
  const width = 102, height = 102;

  // Pet image
  let petImgLeft = new Image();
  petImgLeft.src = 'icon/pig-left.png';
  let imageLoaded = false;

  petImgLeft.onload = () => {
    imageLoaded = true;
    animate();
  };
  petImgLeft.onerror = () => {
    console.error('Could not load pig image from icon/pig-left.png');
    imageLoaded = false;
    animate(); // Still run animation even if image is missing
  };

  let petX = 0, petY = 0, vx = 0, vy = 0, gravity = 0.4;
  let direction = -1, facing = -1;
  let groundY = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 300;
    groundY = canvas.height - height;
    if (petX + width > canvas.width) petX = canvas.width - width;
    if (petY > groundY) petY = groundY;
  }

  function startJump() {
    const speed = 6, angle = Math.PI * 65 / 180;
    vx = direction * speed * Math.cos(angle);
    vy = -speed * Math.sin(angle);
  }

  function setupPet() {
    petX = canvas.width - width - 10;
    petY = groundY;
    startJump();
  }

  function drawBackground() {
    ctx.fillStyle = '#ADD8E6'; // Sky
    ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
    ctx.fillStyle = '#90EE90'; // Ground
    ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  }

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
    if (petY >= groundY) {
      petY = groundY;
      startJump();
    }

    // Draw pet (image or fallback rectangle)
    if (imageLoaded) {
      if (facing === 1) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
        ctx.restore();
      } else {
        ctx.drawImage(petImgLeft, petX, petY, width, height);
      }
    } else {
      ctx.fillStyle = 'pink';
      ctx.fillRect(petX, petY, width, height);
    }

    requestAnimationFrame(animate);
  }

  // --- Stats and interactions below ---

  let pet = {
    happiness: 50,
    hunger: 50,
    cleanliness: 50,
    health: 50,
  };

  function updateStats() {
    const h = document.getElementById('happiness');
    const hu = document.getElementById('hunger');
    const c = document.getElementById('cleanliness');
    const he = document.getElementById('health');
    if (h) h.textContent = pet.happiness;
    if (hu) hu.textContent = pet.hunger;
    if (c) c.textContent = pet.cleanliness;
    if (he) he.textContent = pet.health;
  }

  window.feedPet = function() {
    pet.hunger = Math.max(0, pet.hunger - 15);
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateStats();
  };

  window.playWithPet = function() {
    pet.happiness = Math.min(100, pet.happiness + 10);
    pet.hunger = Math.min(100, pet.hunger + 5);
    updateStats();
  };

  window.cleanPet = function() {
    pet.cleanliness = 100;
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateStats();
  };

  window.sleepPet = function() {
    pet.health = Math.min(100, pet.health + 10);
    pet.hunger = Math.min(100, pet.hunger + 10);
    updateStats();
  };

  window.healPet = function() {
    pet.health = 100;
    pet.happiness = Math.min(100, pet.happiness + 5);
    updateStats();
  };

  // Responsive canvas and initial setup
  resizeCanvas();
  setupPet();
  updateStats();

  window.addEventListener('resize', () => {
    resizeCanvas();
    setupPet();
  });

  // If image loads instantly (cache), start animation
  if (petImgLeft.complete) {
    imageLoaded = true;
    animate();
  }
});
