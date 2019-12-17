import firebase from "@firebase/app";
import "@firebase/auth";
import "@firebase/storage"
import "@firebase/database"
import "@firebase/functions"

let app = null;
let functions = null;

// TODO: Mege with db rtb storage und 1 level up
if ( process.browser ) {
  console.log("######## ENV:", process.env.NODE_ENV, "########");

  console.log("This build is for deploy target:", process.env.VUE_APP_DEPLOY_TARGET);

  const config = {
    apiKey:             process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain:         process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL:        process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId:          process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket:      process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:  process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId:              process.env.VUE_APP_FIREBASE_APP_ID
  }
  // console.log("::: config", config);

  // eslint-disable-next-line
  const env = {
    nodeEnv:      process.env.NODE_ENV,
    deployTarget: process.env.VUE_APP_DEPLOY_TARGET,
    isProduction: process.env.VUE_APP_PRODUCTION
  };
  // console.log("::: env", env);

  /* Initialize Firebase */
  app = firebase.initializeApp(config);

  /* Initialize Cloud Functions through Firebase */
  functions = firebase.functions();

  /* move to debug */
  if (process.env.NODE_ENV !== "production") {
    let features = ["auth", "database", "messaging", "storage"].filter(
      feature => typeof app[feature] === "function"
    );
    console.log("Loaded Firebase Features:", features);
  }

  if ( process.env.VUE_APP_PRODUCTION === 'false' ) {
    if ( !window.helioRxDev ) {
      window.helioRxDev = {};
    }
    window.helioRxDev.app = app;
    window.helioRxDev.firebase = firebase;
  }
} else {
  console.log("--- NO ENV LOADED ---")
}

export { functions, app };
export default firebase;
