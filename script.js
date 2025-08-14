// ===== YOUR FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyA3-FYbaqCcb5Aey48VasDad-k0QIN4pp8",
  authDomain: "visitortracker-5fe22.firebaseapp.com",
  projectId: "visitortracker-5fe22",
  storageBucket: "visitortracker-5fe22.firebasestorage.app",
  messagingSenderId: "992346024109",
  appId: "1:992346024109:web:ff3fb0b147b6e2ac83fe24",
  measurementId: "G-2DREN84XQZ"
};
// =================================

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const output = document.getElementById("output");

// Base visitor data
let visitorData = {
  sessionId: Date.now().toString(),
  page: location.href,
  referrer: document.referrer,
  visitTimeLocal: new Date().toLocaleString(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  userAgent: navigator.userAgent
};

// Start tracking when page loads
window.addEventListener("load", () => {
  logMessage("🌍 Page loaded → Signing in anonymously...");

  auth.signInAnonymously()
    .then(() => {
      logMessage("✅ Signed in anonymously");
      getGPSLocation();
    })
    .catch(err => logMessage("❌ Auth error: " + err.message));
});

// Try GPS location first
function getGPSLocation() {
  logMessage("📍 Attempting GPS location...");
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        logMessage("✅ GPS location obtained");
        visitorData.lat = pos.coords.latitude;
        visitorData.lng = pos.coords.longitude;
        visitorData.accuracy = pos.coords.accuracy;
        visitorData.locationSource = "GPS";
        saveToFirebase();
      },
      err => {
        logMessage("⚠️ GPS failed: " + err.message + " → Using IP location");
        getIPLocation();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    logMessage("❌ Geolocation not supported → Using IP location");
    getIPLocation();
  }
}

// Fallback to IP-based location
function getIPLocation() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      logMessage("✅ IP location obtained");
      visitorData.lat = data.latitude;
      visitorData.lng = data.longitude;
      visitorData.city = data.city;
      visitorData.region = data.region;
      visitorData.country = data.country_name;
      visitorData.locationSource = "IP";
      saveToFirebase();
    })
    .catch(err => {
      logMessage("❌ IP location failed: " + err.message);
      saveToFirebase();
    });
}

// Save to Firestore
function saveToFirebase() {
  visitorData.savedAtServer = firebase.firestore.FieldValue.serverTimestamp();
  db.collection("visits").add(visitorData)
    .then(() => {
      logMessage("💾 Data saved to Firestore");
      logMessage(JSON.stringify(visitorData, null, 2));
    })
    .catch(err => logMessage("❌ Firestore error: " + err.message));
}

// Show messages on page
function logMessage(msg) {
  console.log(msg);
  output.textContent += msg + "\n";
}
