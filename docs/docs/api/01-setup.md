# Helios setup

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'

Vue.use(heliosRX, {

  // Object that contains all generic stores
  models: <Models>,

  // Realtime Databse instance
  db: <Database>,

  // Disable / Enable development mode
  devMode: true / false,

  // User defined API
  userApi: <UserApi>
})
````

## Plugin options

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

### Realtime Databse instance (`db`)

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