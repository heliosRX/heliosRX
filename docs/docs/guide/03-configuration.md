# Configuration

Setup firebase

## Add heliosRX to your main.js

```jsx
import Vue from 'vue'
import heliosRX from 'heliosRX'
import db from "@firebase/app" // TODO

const db = heliosRX.setup({
  definitions: 'src/models',
  api:         'src/api'
  debug:       false,
  firebaseDb:  db,
  // list of ready flags
  //
})

new Vue({
  db: db, // Add this line
  ...
  render: h => h(App)
}).$mount('#app');
```

or

```jsx
import Vue from 'vue'
import heliosRX from 'heliosRX'

Vue.use(heliosRX, {
  definitions: 'src/models',
  debug: false,
})
```

## Create base folder structure

First create the following folder structure:

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
