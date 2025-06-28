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
  // Keep pet inside canvas after resize
  if (petX + width > canvas.width) {
    petX = canvas.width - width;
  }
});

// Constants for pet size
const width = 102, height = 102;  // Actual image size (scaled down)
const groundY = canvas.height - height;  // Set ground to the bottom based on 102px image height

// Pet image
let petImgLeft = new Image();
petImgLeft.src = 'icon/icon-192.png';
let petImgSleep = new Image();
petImgSleep.src = 'icon/pig-sleep.png'; // Image for sleeping pig

let petX = canvas.width - width - 10, petY = groundY; // inside canvas
let vx = 0, vy = 0, gravity = 0.4;
let direction = -1, facing = -1;
let isSleeping = false; // Track sleep state

// Function to start jumping
function startJump() {
  const speed = 6, angle = Math.PI * 65 / 180;
  vx = direction * speed * Math.cos(angle);
  vy = -speed * Math.sin(angle);
}

startJump();

// Draw background with pastel green (ground) and light blue (air)
function drawBackground() {
  // Ground (pastel green)
  ctx.fillStyle = '#90EE90';  // Pastel green color for the ground
  ctx.fillRect(0, canvas.height * 2 / 3, canvas.width, canvas.height / 3);

  // Air (light blue)
  ctx.fillStyle = '#ADD8E6';  // Light blue color for the sky
  ctx.fillRect(0, 0, canvas.width, canvas.height * 2 / 3);
}

// Animation function
function animate() {
  drawBackground();  // Draw the background first

  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear previous frame

  if (isSleeping) {
    // Draw the sleeping image
    ctx.drawImage(petImgSleep, petX, petY, width, height);
  } else {
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
      startJump(); // Restart jump when hitting ground
    }

    // Draw the pet image based on facing direction with flipping
    if (facing === 1) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(petImgLeft, -petX - width, petY, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(petImgLeft, petX, petY, width, height);
    }
  }

  requestAnimationFrame(animate);  // Continue animation loop
}

// Start animation once image is loaded
petImgLeft.onload = () => {
  animate();
};

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

// Sleep functionality for the pet
function sleep() {
  if (!isSleeping) {
    isSleeping = true;
    petImgLeft.src = 'icon/pig-sleep.png'; // Switch to sleeping pig image
    vy = 0; // Stop any vertical movement when the pet is sleeping
    vx = 0; // Stop horizontal movement as well

    // Set timeout to sleep for 5 seconds
    setTimeout(() => {
      petImgLeft.src = 'icon/icon-192.png'; // Revert to original image
      setTimeout(() => {
        isSleeping = false; // Resume jumping after 2 seconds
        startJump(); // Restart jumping after sleep
      }, 2000);
    }, 5000);
  }
}

// Sleep button functionality
document.getElementById('sleepButton').addEventListener('click', sleep);

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

fun
