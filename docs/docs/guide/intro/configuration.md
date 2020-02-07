# Configuration

Before you can start using heliosRX, you have to configure Firebase and heliosRX.
Usually this should be very simple.

::: tip Configure Firebase
If you haven't configured firebase yet, first create a new project in the firebase console

- [console.firebase.google.com](https://console.firebase.google.com/)

then create a `firebase.json` and `.firebaserc.js` by typing:

```bash
firebase login # when ushing firebase the 1st time
firebase init # select newly created project
# 'firebase use' for existing firebase projects
```

Don't forget to also create a database for your project in the Firebase console.
:::


### Create folder structure and configuration files

Next, create the following folder structure:

```
├── rules               - Used for database access rules
│   └── rules.bolt      - Default access rules
└── src
    └── models
        ├── config.js   - Models are assigned to DB paths here
        └── *           - Model definitions (Can be accessed through this.$models)
```

by running

```bash
helios init
```

Alternatively you can create these files manually:

```bash
mkdir -p rules
mkdir -p src/models
touch rules/rules.bolt
touch src/models/config.js
```

After you've successfully created these files and folders your directory structure
should look like shown above.

::: warning Create src/models/index.js
This won't be necessary in future releases, but for now please also create a new file `src/models/index.js`:

```js
import * as GenericStores from './config.js'
for ( let storeName in GenericStores ) {
  GenericStores[ storeName ].setName( storeName )
}
export default GenericStores;
```
:::

### Add heliosRX to your main.js

Next in your `src/main.js` you can import `rtdb` as well as your model
definitions and setup heliosRX:

```js
// file: src/main.js
import Vue from 'vue'
import heliosRX from 'heliosrx'
import { rtdb } from './firebase' // Import realtime database
import models from "@/models"

Vue.use(heliosRX, {
  models:  models,
  devMode: true,
  db:      rtdb,
})

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### Configure Firebase Realtime Database

There is a few ways how you can configure firebase. One way to do it, is to get
your Firebase configuration and put it in a new file in `src/firebase.js` that
looks something like this:

```js
// file: src/firebase.js

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey:            "<YOUR API KEY>",
  authDomain:        "<YOUR AUTH DOMAIN>",
  databaseURL:       "<YOUR DATABASE URL>",
  projectId:         "<YOUR PROJECT ID>",
  storageBucket:     "<YOUR STORAGE BUCKET>",
  messagingSenderId: "<YOUR MESSAING SENDER ID>",
  appId:             "<YOUR APP ID>"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime DB
export const rtdb = firebase.database();
```

Please feel free to do this in a way that suits your needs best.
The important thing here is that we need to import `rtdb` in our `main.js`,
which is why we're exporting it here.
