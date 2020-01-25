# HeliosRX setup

## Setup Frontend

heliosRX can be used as a Vue plugin:

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'

Vue.use(heliosRX, {

  // Object that contains all generic stores
  models: <Models>,

  // Realtime Database instance
  db: <Database>,

  // Disable / Enable development mode
  devMode: true / false,

  // User defined API
  userApi: <UserApi>,

  // useExistingStore
  useExistingStore: null | <VuexStore>,
})
```

### Generic stores (`models`)

- **models:** `Object { string: GenericStore }`

Object that contains all generic stores
```js
{
  task: new GenericStore(...),
  user: new GenericStore(...),
...
}
```

### Realtime Database instance (`db`)

- **db:** `Object { string: Database } | Database`

Usualy the return value of `firebase.database()`
Alternatively an object with multiple databases can be passed here:
```js
{
  db1: firebase.database(),
  db2: firebase.database(app2),
  db3: firebase.database(app3),
}
```
See: https://firebase.google.com/docs/database/usage/sharding

### Development mode (`devMode`)

- **devMode:** `true / false`

Disable / Enable development mode
In development mode `$models`, `$api`, `$db` is made available on the console,
also helpful debug messages are printed to the console

### User defined API (`userApi`)

- **userApi:** `Object { string: Function }`

An additional user API, that should be made available throught the helios
interface (`this.$api`).

```js
{
  auth_login() { ... },
  auth_logout() { ... },
}
```

### Use existing store (`useExistingStore`)

- **useExistingStore:** `null | new Vuex.Store`

heliosRX can use an existing Vuex store for state management. If no existing store is provided,
helios will create a new Vuex store. Having two stores is also usually not a problem, although
not recommended according to the Vuex documentation. <!-- ??? -->
However, the only good reason I can come up with, why you shouldn't do that, is that
the Vue Dev tools don't support multiple Vuex stores.

<!--
### Ready flags (`readyFlags`)
### Plugins (`plugins`)

```js
const db = heliosRX.setup({

  //  ...
  definitions: <PATH>,

  //  ...
  api:         <PATH>,

  //  ...
  debug:       Boolean,
})
```
-->

## Setup Backend (Node.js)

::: warning Work in Progress (20/1/2020)
This section is still a work in progress. It will be updated soon.
:::

```js
import heliosRX from 'heliosRX'

heliosRX.setup({

  //
  runAsUser: false | null | <String>,

  //
  firebaseApp: null | <FirebaseApp>,

  // Realtime Database instance
  db: <Database>,

  // Disable / Enable development mode
  devMode: true / false,

  /*
  // Object that contains all generic stores
  models: <Models>,

  // User defined API
  userApi: <UserApi>,

  // useExistingStore
  useExistingStore: null | <VuexStore>,
  */
})
```

- TODO: Bundle heliosRX + Vue/Vuex + your models as lib
