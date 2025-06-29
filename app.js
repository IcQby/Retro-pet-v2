const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 300;  // Fixed height for the canvas (300 pixels)
}
resizeCanvas();

// Keep canvas resized when window is resized
window.addEventListener('resize', () => {
  resizeCanvas();
  if (petX + width > canvas.width) {
    petX = canvas.width - width;
  }
});

// Constants for pet size
const width = 102, height = 102;
const groundY = canvas.height - height;

// Pet images
let petImgLeft = new Image();
petImgLeft.src = 'icon/icon-192.png';
let petImgSleep = new Image();
petImgSleep.src = 'icon/pig-sleep.png';

// Variables for pet movement and state
let petX = canvas.width - width - 10, petY = groundY;
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;
let jumping = true;  // Indicates if the pig is currently jumping
let sleeping = false; // Indicates if the pig is in sleep mode

// Function to start jumping
function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

// Draw background with pastel green (ground) and light blue (air)
function drawBackground() {
  ctx.fillStyle = '#90EE90';  // Ground (pastel green)
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);

  ctx.fillStyle = '#ADD8E6';  // Air (light blue)
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

// Animation function
function animate() {
  drawBackground();

  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame

  if (sleeping) {
    ctx.drawImage(petImgSleep, petX, petY, width, height);  // Show sleeping pet
    return;  // Stop further movement during sleep
  }

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

  // Bounce off ground and start jumping again
  if (petY >= groundY) {
    petY = groundY;
    if (jumping) startJump(); // Start jumping again after landing
  }

  // Draw the pet image based on facing direction
  if (facing === 1) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(petImgLeft, petX, petY, width, height);
  }

  requestAnimationFrame(animate);  // Continue animation loop
}

// Start animation once image is loaded
petImgLeft.onload = () => {
  petImgSleep.onload = () => {
    animate();
  };
};

// Sleep button functionality
document.getElementById('sleepButton').addEventListener('click', () => {
  if (!sleeping) {
    jumping = false;  // Stop jumping when sleep is triggered
    sleeping = true;  // Start sleep animation

    setTimeout(() => {
      // After 5 seconds, wake up and resume jumping
      sleeping = false;
      jumping = true;
      startJump();  // Start jumping after sleep
    }, 5000);  // Sleep duration (5 seconds)
  }
});


// --- Stats and interactions below (unchanged) ---

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

function feedPet() {
  pet.hunger = Math.max(0, pet.hunger - 15);
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
  registerBackgroundSync('sync-feed-pet');
}

function playWithPet() {
  pet.happiness = Math.min(100, pet.happiness + 10);
  pet.hunger = Math.min(100, pet.hunger + 5);
  updateStats();
}

function cleanPet() {
  pet.cleanliness = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

function sleepPet() {
  pet.health = Math.min(100, pet.health + 10);
  pet.hunger = Math.min(100, pet.hunger + 10);
  updateStats();
}

function healPet() {
  pet.health = 100;
  pet.happiness = Math.min(100, pet.happiness + 5);
  updateStats();
}

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

// Sleep Sequence function
function initiateSleepSequence() {
  // Stop pet's movement temporarily
  sleeping = true;
  petY = groundY; // Ensure pet stays on the ground during sleep
  
  // Update stats for sleep action
  pet.health = Math.min(100, pet.health + 10);  // Increase health during sleep
  updateStats();

  // Sleep for 5 seconds before waking up
  setTimeout(() => {
    sleeping = false;
    petY = groundY;  // Ensure the pet stays on the ground after waking up
    startJump(); // Restart jump after waking up
  }, 5000);  // Sleep for 5 seconds
}

// Button to trigger sleep (simulate button click)
document.getElementById('sleepButton').addEventListener('click', () => {
  if (!sleeping) {
    jumpInProgress = false;  // Stop jumping when sleep is triggered
    petY = groundY;  // Ensure the pet is on the ground
    initiateSleepSequence();  // Start the sleep sequence
  }
});

// Initial setup
window.onload = () => {
  updateStats();
  askPushPermissionAndSubscribe();
};
