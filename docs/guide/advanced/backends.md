# Backends

::: warning Warning
This is the planned API. It is not yet implemented. It can be expected to be ready Q1 2020.
:::

::: warning Work in Progress (06/02/2020)
This section is still a work in progress. It will be updated soon.
:::

### Document

```js
// file: custom-backend/document.js
import { Document } from 'heliosrx'

export class CustomDocument extends Document {

  constructor( path ) {
    this._path = path;
  }

  update( payload ) {
    const new_id = 1;
    // ...
    return Promise.resolve(new_id)
  }

  remove() {
    const new_id = 1;
    // ...
    return Promise.resolve(new_id)
  }

  fetch({ init, set, error }) {
    // ...
    return () => { /* unsubscribe */ }
  }

  bind({ init, set, error }) {
    // ...
    return () => { /* unsubscribe */ }
  }
}
```

### Collection

```js
// file: custom-backend/collection.js
import { Collection } from 'heliosrx'

export class CustomCollection extends Collection {
  constructor( path, query ) {
    this._path = path;
    this._query = query;
  }

  fetch({ init, once, error }) {
    // ...
    return () => { /* unsubscribe */ }
  }

  bind({ init, add, remove, set, once, error }) {
    // ...
    return () => { /* unsubscribe */ };
  }
}

```

### Database

```js
// file: custom-backend/database.js
import { Database } from 'heliosrx'
import CustomDocument from './document'
import CustomCollection from './collection'

export class CustomDatabase extends Database {

  constructor( options ) {
  }

  createDocument( path = '/' ) {
    return new CustomDocument( path );
  }

  createCollection( path = '/' ) {
    return new CustomCollection( path );
  }

  createQueryCollection({
    path = '/',
    key = undefined,
    value = undefined,
    limit = undefined,
    startAt = undefined,
    endAt = undefined,
  }) {
    const query = { key, value, limit, startAt, endAt };
    return new CustomCollection( path, query )
  }
}
```

### Setup

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'
import customBackend from './custom-backend/database'

Vue.use(heliosRX, {
  // Your custom backend
  db: customBackend( options ),
  ...
})
```

<!-- TODO: db: firebaseBackend( rtdb ), -->
