// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA3-FYbaqCcb5Aey48VasDad-k0QIN4pp8",
    authDomain: "visitortracker-5fe22.firebaseapp.com",
    projectId: "visitortracker-5fe22",
    storageBucket: "visitortracker-5fe22.firebasestorage.app",
    messagingSenderId: "992346024109",
    appId: "1:992346024109:web:ff3fb0b147b6e2ac83fe24",
    measurementId: "G-2DREN84XQZ"
  };
  
  // Init Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Sign in anonymously
  auth.signInAnonymously().catch(console.error);
  
  // Visitor Data
  let visitorData = {
    sessionId: Date.now().toString(),
    page: location.href,
    referrer: document.referrer,
    visitTimeLocal: new Date().toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent
  };
  
  // Function to save to Firebase
  function saveToFirebase() {
    visitorData.savedAtServer = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("visits").add(visitorData)
      .then(() => {
        document.getElementById("output").textContent = JSON.stringify(visitorData, null, 2);
        alert("Data saved to Firebase!");
      })
      .catch(console.error);
  }
  
  // GPS First, then IP Fallback
  document.getElementById("getLocation").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        visitorData.lat = pos.coords.latitude;
        visitorData.lng = pos.coords.longitude;
        visitorData.accuracy = pos.coords.accuracy;
        saveToFirebase();
      }, () => {
        console.warn("GPS denied, using IP-based location");
        getIPLocation();
      }, { enableHighAccuracy: true, timeout: 10000 });
    } else {
      getIPLocation();
    }
  });
  
  // Get location via IP
  function getIPLocation() {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        visitorData.lat = data.latitude;
        visitorData.lng = data.longitude;
        visitorData.city = data.city;
        visitorData.region = data.region;
        visitorData.country = data.country_name;
        visitorData.locationSource = "IP";
        saveToFirebase();
      })
      .catch(err => {
        console.error("IP location failed", err);
        saveToFirebase();
      });
  }
  