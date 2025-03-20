// Firebase Web Push Notification for Madrasa Sikariya

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfqQkLMdirE1s3QDAU-k8kZJDSJ-AHfxI",
  authDomain: "madrsa-sikariya.firebaseapp.com",
  projectId: "madrsa-sikariya",
  storageBucket: "madrsa-sikariya.firebasestorage.app",
  messagingSenderId: "1066102927865",
  appId: "1:1066102927865:web:d5e649be4178d363408d28",
  measurementId: "G-3S96TVYFJC"
};

// VAPID Key
const vapidKey = "BClpcTQygEYX1ueX4n8GTMN0UmSsaeM1JwpbRoI81WxOaHGB4gQHJl-bNiyBJmp_c5CryDL0NGiWAd2a7z3CpB4";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM token storage key in localStorage
const FCM_TOKEN_KEY = 'fcm_token';

// Request permission and get token
export function requestNotificationPermission() {
  console.log('Requesting notification permission...');
  
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Make sure service worker is registered before getting token
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          console.log('Service worker is ready for messaging');
          
          // Get FCM registration token
          getToken(messaging, { 
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
          })
            .then((currentToken) => {
              if (currentToken) {
                // Save token to localStorage
                localStorage.setItem(FCM_TOKEN_KEY, currentToken);
                console.log('Token received:', currentToken);
                
                // Send token to your server
                sendTokenToServer(currentToken);
                
                // Update UI to show user is subscribed
                updateSubscriptionUI(true);
              } else {
                console.log('No registration token available. Request permission to generate one.');
                updateSubscriptionUI(false);
              }
            })
            .catch((err) => {
              console.log('An error occurred while retrieving token. ', err);
              updateSubscriptionUI(false);
            });
        });
      }
    } else {
      console.log('Unable to get permission to notify.');
      updateSubscriptionUI(false);
    }
  });
}

// Send token to server (replace with your actual server endpoint)
function sendTokenToServer(token) {
  // You would implement this to send the token to your server
  console.log('Sending token to server:', token);
  
  // Example implementation (uncomment and modify for your backend):
  /*
  fetch('https://your-server-url/api/register-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Token registered with server:', data);
  })
  .catch(error => {
    console.error('Error registering token with server:', error);
  });
  */
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  
  // Create notification manually since we're in foreground
  if (payload.notification) {
    const { title, body } = payload.notification;
    
    // Show custom notification
    showCustomNotification(title, body, payload.data);
  }
});

// Show custom notification
function showCustomNotification(title, body, data) {
  const notificationElement = document.createElement('div');
  notificationElement.className = 'custom-notification';
  
  notificationElement.innerHTML = `
    <div class="notification-content">
      <h4>${title}</h4>
      <p>${body}</p>
      <button class="close-btn">×</button>
    </div>
  `;
  
  document.body.appendChild(notificationElement);
  
  // Add fade-in animation
  setTimeout(() => {
    notificationElement.classList.add('show');
  }, 100);
  
  // Add event listener to close button
  const closeBtn = notificationElement.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    notificationElement.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notificationElement);
    }, 300);
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notificationElement)) {
      notificationElement.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notificationElement)) {
          document.body.removeChild(notificationElement);
        }
      }, 300);
    }
  }, 5000);
}

// Update the UI based on subscription status
function updateSubscriptionUI(isSubscribed) {
  const subscribeButton = document.getElementById('notification-subscribe');
  if (!subscribeButton) return;
  
  if (isSubscribed) {
    subscribeButton.textContent = 'आप नोटिफिकेशन प्राप्त कर रहे हैं';
    subscribeButton.classList.add('subscribed');
    subscribeButton.disabled = true;
  } else {
    subscribeButton.textContent = 'नोटिफिकेशन के लिए सब्सक्राइब करें';
    subscribeButton.classList.remove('subscribed');
    subscribeButton.disabled = false;
  }
}

// Check subscription status on page load
export function checkSubscriptionStatus() {
  const token = localStorage.getItem(FCM_TOKEN_KEY);
  updateSubscriptionUI(!!token);
  return !!token;
}

// Initialize notification system
export function initializeNotifications() {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  // Check service worker support
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return;
  }
  
  // Check if already subscribed
  const isSubscribed = checkSubscriptionStatus();
  console.log('User is ' + (isSubscribed ? '' : 'not ') + 'subscribed to notifications');
  
  // Set up subscribe button if it exists
  const subscribeButton = document.getElementById('notification-subscribe');
  if (subscribeButton) {
    subscribeButton.addEventListener('click', requestNotificationPermission);
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNotifications); 
