import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  authDomain: "banana-project-9ef31.firebaseapp.com",
  projectId: "banana-project-9ef31",
  storageBucket: "banana-project-9ef31.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012",
  databaseURL: "https://banana-project-9ef31-default-rtdb.firebaseio.com"
};

// Initialize Firebase only if it hasn't been initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Realtime Database
const database = getDatabase(app);

// Log connection status
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('Connected to Firebase Realtime Database');
  } else {
    console.log('Disconnected from Firebase Realtime Database');
  }
});

export { database };

