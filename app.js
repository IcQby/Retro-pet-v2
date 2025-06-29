// --- Canvas and Pet Animation ---
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// --- Responsive Canvas ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Pet Images ---
const width = 102, height = 102;
let petImgLeft = new Image();
petImgLeft.src = 'icon/pig-left.png';
let petImgRight = new Image();
petImgRight.src = 'icon/pig-right.png';
let petImgSleep = new Image();
petImgSleep.src = 'icon/pig-sleep.png';

// --- Pet Animation State ---
let petX = canvas.width - width - 10;
let petY = canvas.height - height;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1; // -1=left, 1=right

// --- Sleep Animation States ---
let shouldSleep = false; // Set to true when sleep button is pressed
let sleepPhase = null;   // null, "pause1", "sleep", "pause2"
let sleepPhaseStart = 0;
let sleepPhaseImg = null;
let resumeDirection = direction;
let resumeVx = vx;
let sleepQueued = false;

function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

startJump();

function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

function getCurrentPigImg() {
  if (sleepPhase === "sleep") {
    return petImgSleep;
  } else if (sleepPhase === "pause1" || sleepPhase === "pause2") {
    return sleepPhaseImg;
  } else {
    return direction === 1 ? petImgRight : petImgLeft;
  }
}

function animate(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  let currentImg = getCurrentPigImg();

  // Sleep state machine
  if (sleepPhase) {
    if (sleepPhase === "pause1") {
      if (!sleepPhaseStart) sleepPhaseStart = performance.now();
      // 1 second pause before sleep image
      if (performance.now() - sleepPhaseStart >= 1000) {
        sleepPhase = "sleep";
        sleepPhaseStart = performance.now();
      }
    } else if (sleepPhase === "sleep") {
      // 5 seconds with sleep image
      if (performance.now() - sleepPhaseStart >= 5000) {
        sleepPhase = "pause2";
        sleepPhaseStart = performance.now();
      }
    } else if (sleepPhase === "pause2") {
      // 2 seconds pause after sleep, then resume animation
      if (performance.now() - sleepPhaseStart >= 2000) {
        sleepPhase = null;
        sleepPhaseStart = 0;
        sleepPhaseImg = null;
        // Resume movement in same direction as before
        direction = resumeDirection;
        startJump();
      }
    }
    // Draw pig (no movement)
    ctx.drawImage(currentImg, petX, petY, width, height);
    requestAnimationFrame(animate);
    return;
  }

  // Only move if not in sleep sequence
  vy += gravity;
  petX += vx;
  petY += vy;

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

    // --- Sleep sequence trigger ---
    if (shouldSleep && !sleepQueued) {
      // Pause movement for 1s, sleep 5s, pause 2s, resume
      sleepQueued = true;
      shouldSleep = false;
      sleepPhase = "pause1";
      sleepPhaseImg = direction === 1 ? petImgRight : petImgLeft;
      resumeDirection = direction;
      vx = 0;
      vy = 0;
      sleepPhaseStart = performance.now();
      requestAnimationFrame(animate);
      return;
    }

    // Only start new jump if not sleeping
    startJump();
  }

  ctx.drawImage(currentImg, petX, petY, width, height);

  // Reset sleepQueued after sleep ends
  if (!sleepPhase && sleepQueued) {
    sleepQueued = false;
  }

  requestAnimationFrame(animate);
}

// --- Stats Logic ---
let pet = {
  happiness: 50,
  hunger: 50,
  cleanliness: 50,
  health: 50,
};

function updateStats() {
  document.getElementById('happiness').textContent = pet.happiness;
  document.getElementById('hunger').textContent = pet.hunger;
  document.getElementById('cleanliness').textContent = pet.cleanliness;
  document.getElementById('health').textContent = pet.health;
}

// --- Pet Care Functions ---
window.feedPet = function() {
  pet.hunger = Math.max(0, pet.hunger - 15);
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
  registerBackgroundSync('sync-feed-pet');
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
  // Request sleep on next ground contact
  shouldSleep = true;
};
window.healPet = function() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
};

// --- Background Sync & Push ---
function registerBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register(tag).then(() => {
        console.log(`Background sync registered for ${tag}`);
      }).catch(err => {
        console.log('Background sync registration failed:', err);
      });
    });
  }
}
function askPushPermissionAndSubscribe() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging not supported');
    return;
  }
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      subscribeUserToPush();
    } else {
      console.log('Push permission denied');
    }
  });
}
function subscribeUserToPush() {
  navigator.serviceWorker.ready.then(registration => {
    const vapidPublicKey = 'BOrX-ZnfnDcU7wXcmnI7kVvIVFQeZzxpDvLrFqXdeB-lKQAzP8Hy2LqzWdN-s2Yfr3Kr-Q8OjQ_k3X1KNk1-7LI';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    }).then(subscription => {
      console.log('User subscribed to push:', subscription);
    }).catch(err => {
      console.log('Failed to subscribe user:', err);
    });
  });
}
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// --- Start Everything ---
Promise.all([
  new Promise(resolve => petImgLeft.onload = resolve),
  new Promise(resolve => petImgRight.onload = resolve),
  new Promise(resolve => petImgSleep.onload = resolve)
]).then(() => {
  animate();
});

window.addEventListener('DOMContentLoaded', () => {
  updateStats();
  askPushPermissionAndSubscribe();
});
