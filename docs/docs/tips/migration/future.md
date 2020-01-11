# Future

### FUTURE API: Add heliosRX to your main.js

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'
import { rtdb1, rtdb2, rtdb3 } from './firebase' // Import realtime database

const db = heliosRX.setup({
  // definitions: 'src/models',
  userModels:  'src/models',
  // userModels:  requireContext('src/models'),
  userModels:  require.context('./models/', true, /\.model\.js$/ ),
  userApi:     'src/api'
  devMode:     false,
  firebaseDb:  {
    db1: rtdb1,
    db2: rtdb2,
    db3: rtdb3,
  },
  plugins: [],
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
