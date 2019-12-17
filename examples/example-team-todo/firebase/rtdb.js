import firebase from "./firebase";

//firebase.database.enableLogging(true);
const rtdb = firebase.database();

if ( process.env.VUE_APP_PRODUCTION === 'false' && process.browser ) {
  window.helioRxDev.rtdb = rtdb;
}

// rtdb.INTERNAL.forceLongPolling();
// rtdb.INTERNAL.forceWebSockets();

export default rtdb;

// TODO: https://firebase.google.com/docs/database/web/offline-capabilities
