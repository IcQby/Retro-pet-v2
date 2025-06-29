// --- Sleep Sequence Logic ---
function runSleepSequence() {
  sleepSequenceStep = 1;
  sleepSequenceActive = true;
  sleepRequested = false; // reset request
  let originalDirection = direction;
  let imgA = (originalDirection === 1) ? petImgRight : petImgLeft;
  let imgB = (originalDirection === 1) ? petImgLeft : petImgRight;
  currentImg = imgA;
  vx = 0; vy = 0; // Stop the pig

  // Fall asleep animation: 1s original, 0.5s opposite, 0.5s original, 0.5s opposite, then sleep for 5s, then wake up (2s original)
  setTimeout(() => {
    currentImg = imgB;
    setTimeout(() => {
      currentImg = imgA;
      setTimeout(() => {
        currentImg = imgB;
        setTimeout(() => {
          currentImg = petImgSleep;
          isSleeping = true;
          sleepSequenceActive = false;
          // Sleep for 5 seconds
          setTimeout(() => {
            // Wake up: show original facing for 2s, then jump
            currentImg = imgA;
            isSleeping = false;
            // --- Hold still for 2 seconds before jumping ---
            setTimeout(() => {
              sleepSequenceStep = 0;
              sleepSequenceActive = false;
              startJump();
            }, 2000);
          }, 5000);
        }, 500);
      }, 500);
    }, 500);
  }, 1000);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!isSleeping && !sleepSequenceActive) {
    vy += gravity;
    petX += vx;
    petY += vy;
  }

  // Walls
  let hitEdge = false;
  if (!isSleeping && !sleepSequenceActive) {
    if (petX <= 0) {
      petX = 0;
      direction = 1;
      vx = Math.abs(vx);
      currentImg = petImgRight; // Show right-facing
      hitEdge = true;
    } else if (petX + width >= canvas.width) {
      petX = canvas.width - width;
      direction = -1;
      vx = -Math.abs(vx);
      currentImg = petImgLeft; // Show left-facing
      hitEdge = true;
    }
  }

  // Ground
  let groundY = canvas.height - height;
  if (petY >= groundY) {
    petY = groundY;
    if (sleepRequested && !sleepSequenceActive) {
      runSleepSequence();
    } else if (!isSleeping && !sleepSequenceActive && !sleepRequested) {
      startJump();
    }
  }

  // Draw pig
  ctx.drawImage(currentImg, petX, petY, width, height);

  requestAnimationFrame(animate);
}
