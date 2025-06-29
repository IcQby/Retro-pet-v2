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

function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

// --- Sleep Sequence State ---
let sleepRequested = false; // Set when sleep is requested by button
let sleepState = null;  // null, "pause1", "sleep", "pause2"
let sleepStartTime = 0;
let sleepFacing = -1; // Direction to face during sleep
let wasMoving = false; // To block multiple triggers

function drawBackground() {
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);
  ctx.fillStyle = '#ADD8E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

function getCurrentPigImg() {
  if (sleepState === "sleep") {
    return petImgSleep;
  } else {
    // Use frozen facing if in pause1 or pause2, else live direction
    let useDir = sleepState ? sleepFacing : direction;
    return useDir === 1 ? petImgRight : petImgLeft;
  }
}

function animate(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  let currentImg = getCurrentPigImg();

  // --- Handle Sleep Sequence State Machine ---
  if (sleepState !== null) {
    // All sleep phases are stationary
    ctx.drawImage(currentImg, petX, petY, width, height);

    let elapsed = performance.now() - sleepStartTime;
    if (sleepState === "pause1" && elapsed >= 1000) {
      sleepState = "sleep";
      sleepStartTime = performance.now();
    } else if (sleepState === "sleep" && elapsed >= 5000) {
      sleepState = "pause2";
      sleepStartTime = performance.now();
    } else if (sleepState === "pause2" && elapsed >= 2000) {
      sleepState = null;
      sleepFacing = -1;
      startJump();
    }
    requestAnimationFrame(animate);
    return;
  }

  // --- Normal Movement ---
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
    if (sleepRequested) {
      // Begin sleep sequence
      sleepRequested = false;
      sleepState = "pause1";
      sleepStartTime = performance.now();
      sleepFacing = direction;
      vx = 0;
      vy = 0;
      ctx.drawImage(currentImg, petX, petY, width, height);
      requestAnimationFrame(animate);
      return;
    }
    startJump();
  }

  ctx.drawImage(currentImg, petX, petY, width, height);

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
  // Request sleep on next landing
  if (sleepState === null && !sleepRequested) {
    sleepRequested = true;
  }
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
