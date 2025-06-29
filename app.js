// ... (setup code unchanged) ...

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Only move if not in sleep sequence
  if (!sleepSequenceActive) {
    vy += gravity;
    petX += vx;
    petY += vy;
  }

  // Walls
  if (petX <= 0) {
    petX = 0;
    direction = 1;
    vx = Math.abs(vx);
  } else if (petX + width >= canvas.width) {
    petX = canvas.width - width;
    direction = -1;
    vx = -Math.abs(vx);
  }

  // Ground
  let groundY = canvas.height - height;
  if (petY >= groundY) {
    petY = groundY;
    if (sleepSequenceActive && sleepSequenceStep === 0) {
      runSleepSequence();
    } else if (!sleepSequenceActive) {
      startJump();
    }
  }

  ctx.drawImage(currentImg, petX, petY, width, height);

  requestAnimationFrame(animate);
}

function runSleepSequence() {
  sleepSequenceStep = 1;
  sleepSequenceActive = true;
  controlsLocked = true;
  let originalDirection = direction;
  let originalImg = (originalDirection === 1) ? petImgRight : petImgLeft;
  let altImg = (originalDirection === 1) ? petImgLeft : petImgRight;
  currentImg = originalImg;
  vx = 0; vy = 0;

  setTimeout(() => {
    currentImg = altImg;
    setTimeout(() => {
      currentImg = originalImg;
      setTimeout(() => {
        currentImg = altImg;
        setTimeout(() => {
          currentImg = petImgSleep;
          setTimeout(() => {
            currentImg = originalImg;
            setTimeout(() => {
              sleepSequenceStep = 0;
              sleepSequenceActive = false;
              controlsLocked = false;
              startJump();
            }, 2000); // 2s original direction after sleep
          }, 5000); // 5s sleep
        }, 500); // third switch
      }, 500); // second switch
    }, 500); // first switch back
  }, 1000); // 1s stop
}

// ... (rest of code unchanged) ...

window.sleepPet = petCareWrapper(function() {
  pet.health = Math.min(100, pet.health + 10);
  pet.hunger = Math.min(100, pet.hunger + 10);
  updateStats();
  if (!sleepSequenceActive) {
    sleepSequenceActive = true;
    sleepSequenceStep = 0;
    // The sleep sequence will start after next landing
  }
});
