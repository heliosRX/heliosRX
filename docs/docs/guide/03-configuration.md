# Configuration

Before you can start using heliosRX ,you have to configure Firebase and heliosRX.
Usually this should be very simple.

## Configure Firebase Realtime Database

This is really up to you, but one way to do it, is to get your Firebase
configuration and but it in a new file in `src/firebase.js` that looks
something like this:

```js
// file: src/firebase.js

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "<YOUR API KEY>",
  authDomain: "heliosrx-demo1.firebaseapp.com",
  databaseURL: "https://heliosrx-demo1.firebaseio.com",
  projectId: "heliosrx-demo1",
  storageBucket: "heliosrx-demo1.appspot.com",
  messagingSenderId: "<YOUR MESSAING SENDER ID>",
  appId: "<YOUR APP ID>"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime DB
export const rtdb = firebase.database();
```

Please feel free to do this in a way that suits your needs best.
The important thing here is that we need to import `rtdb` later on,
which is why we're exporting it here.

## Create folder structure and configuration files

Next create the following folder structure:

```bash
mkdir -p db/rules
mkdir -p src/models
touch db/rules/rules.bolt
touch src/models/config.js
```

after you successfully created these files and folders your directory structure
should look like this:

```
├── db                  - Used for admin and database scripts
│   └── rules           - Database access rules
│       └── rules.bolt  - add new database models to get necessary permission
└── src              
    └── models
        ├── config.js   - Models are assigned to DB paths here
        └── *           - Model definitions (Can be accessed through this.$models)
```

alternatively you can execute

```bash
helios init
```

which will create these files and folders automatically.

## Add heliosRX to your main.js

Next in your `src/main.js` you can import `rtdb` as well as your model
definitions and setup heliosRX:

```js
// file: src/main.js
import Vue from 'vue'
import heliosRX from 'heliosrx'
import api from 'heliosrx/src/api' // TODO: Remove
import { rtdb } from './firebase' // Import realtime database
import models from "@/models" // TODO

Vue.use(heliosRX, {
  models: models,
  api: api, // TODO: Remove
  // TODO: rtdb: rtdb,
})

heliosRX.GenericStore.setDefaultDB( rtdb );
heliosRX.registry.commit('INIT_REGISTRY');

new Vue({
  render: h => h(App),
}).$mount('#app')
```

## FUTURE API: Add heliosRX to your main.js

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'
import { rtdb1, rtdb2, rtdb3 } from './firebase' // Import realtime database

const db = heliosRX.setup({
  // definitions: 'src/models',
  userModels:  'src/models',
  userApi:     'src/api'
  devMode:     false,
  firebaseDb:  {
    db1: rtdb1,
    db2: rtdb2,
    db3: rtdb3,
  },
  // list of ready flags
})

new Vue({
  ...
  render: h => h(App)
}).$mount('#app');
```

or

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'

Vue.use(heliosRX, {
  definitions: 'src/models',
  debug: false,
})
```
