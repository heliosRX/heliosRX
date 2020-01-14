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
  apiKey: "AIzaSyA-0-IaxG70yiVkHp7YENQly17xojCrUpY",
  authDomain: "heliosrx-demo1.firebaseapp.com",
  databaseURL: "https://heliosrx-demo1.firebaseio.com",
  projectId: "heliosrx-demo1",
  storageBucket: "heliosrx-demo1.appspot.com",
  messagingSenderId: "208675606741",
  appId: "1:208675606741:web:48f80d31c8ae96b21f125c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime DB
export const rtdb = firebase.database();

if ( process.env.VUE_APP_PRODUCTION === 'false' && process.browser ) {
  window.helioRxDev.rtdb = rtdb;
}
