import GenericStore from '@/store'
import firebase from "firebase"
const chalk = require('chalk');

import { testCases } from './generic-store.spec.js'

// const AUTHENTICATE_AS_USER = false;
const AUTHENTICATE_AS_USER = "test@test.com";
const AUTHENTICATE_WITH_PASSWORD = "test123";

// console.log("Got genstores", Object.keys(genstores))
// console.log("Got  testCases", Object.keys( testCases))

// const matchTestName = 'test_rem_item';
const matchTestName = 'test_path_interpolation';

/* --------------------------- Test Runner ---------------------------- */

let EXIT_CONDITION = false;
if ( AUTHENTICATE_AS_USER ) {
  firebase
    .auth()
    .signInWithEmailAndPassword(AUTHENTICATE_AS_USER, AUTHENTICATE_WITH_PASSWORD)
    .then(async (result) => {
      console.log("Sucessfully logged in. User id is", result.user.uid);
      GenericStore.UserId = result.user.uid;

      let testCaseNames = Object.keys(testCases)
        .filter(key => typeof testCases[key] === "function")
        .filter(key => !matchTestName || key.includes(matchTestName) );

      let total = testCaseNames.length;
      for ( var c = 0; c < total; c++) {
        let key = testCaseNames[ c ];
        console.log(chalk.blue(`[${c + 1}/${total}] ------------------------------------ Test: ${key}`));
        let result = null;
        try {
          result = await testCases[ key ]()
        } catch (e) {
          console.log(chalk.red("Test", key, "failed with exception"));
          console.error(e);
        }
        console.log(chalk.green("succeeded"));
        console.log(result)
      }

      EXIT_CONDITION = true;
    })
    .catch(e => {
      console.log(chalk.red("Can not login:", e));
    })
}

function wait () {
  return EXIT_CONDITION ? process.exit(1) : setTimeout(wait, 1000);
}

wait();
