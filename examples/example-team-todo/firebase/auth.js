import firebase from "./firebase"
import resourceLoader from '@/resource-loader'
// TODO: ^ this should be removed when moving to separate lib

if ( process.env.VUE_APP_PRODUCTION === 'false' && process.browser ) {
  window.helioRxDev.auth = firebase.auth();
}

/*
HACK TO FORCE ALLOWED LOGIN:
var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({prompt: 'select_account'});
firebase.auth().signInWithPopup(provider);
*/

// INFO: /.info/connected is a boolean value which is not synchronized between
//       Realtime Database clients because the value is dependent on the state
//       of the client. In other words, if one client reads /.info/connected as false,
//       this is no guarantee that a separate client will also read false.

let user_siggned_in = false;

firebase.database().ref(".info/connected").on("value", (snap) => {
  if ( snap.val() === true ) {
    resourceLoader.onDatabaseConnect();
  } else {
    resourceLoader.onDatabaseDisconnect();
  }
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User signed in or was authenticated during load
    user_siggned_in = true;
    resourceLoader.afterUserSignIn(user);
  } else if ( user_siggned_in ) {
    // User was signed in and now signed out
    resourceLoader.afterUserSignOut();
    user_siggned_in = false;
  } else {
    // User was not authenticated during load
    resourceLoader.afterUserNoAuthentication();
    user_siggned_in = false;
  }
});
