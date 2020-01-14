// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
// import "firebase/firestore";
import "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey:             process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain:         process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.VUE_APP_FIREBASE_APP_ID
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime DB
export const rtdb = firebase.database();

if ( process.env.VUE_APP_PRODUCTION === 'false' && process.browser ) {
  window.helioRxDev.rtdb = rtdb;
}
