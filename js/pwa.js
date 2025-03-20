// PWA functionality for Madrasa Sikariya

// Register Service Workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register main service worker
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Main Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Main Service Worker registration failed:', error);
      });
      
    // Register Firebase Messaging service worker
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Messaging Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Firebase Messaging Service Worker registration failed:', error);
      });
  });
}

// Handle "Add to Home Screen" (install) event
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Store the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button or notification to user
  showInstallPromotion();
});

// Function to show the install promotion
function showInstallPromotion() {
  const installBanner = document.createElement('div');
  installBanner.className = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div class="pwa-install-content">
      <p>Install this app on your device for offline access</p>
      <button id="installPWA" class="pwa-install-btn">Install App</button>
      <button id="dismissPWA" class="pwa-dismiss-btn">Not now</button>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Set up event listeners for the buttons
  document.getElementById('installPWA').addEventListener('click', installPWA);
  document.getElementById('dismissPWA').addEventListener('click', dismissInstallPromotion);
}

// Function to handle Install button click
function installPWA() {
  // Hide the install banner
  const banner = document.querySelector('.pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
  
  // Show the install prompt
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt since it can't be used again
      deferredPrompt = null;
    });
  }
}

// Function to dismiss the install promotion
function dismissInstallPromotion() {
  const banner = document.querySelector('.pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('Application was installed successfully');
  // Hide the install promotion
  const banner = document.querySelector('.pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
});
