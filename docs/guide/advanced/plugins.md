# Plugins

::: warning Work in Progress (06/02/2020)
This section is still a work in progress. It will be updated soon.
:::

```js
// file: ./custom-plugin/collection-subscriber.js
import { CollectionSubscriber } from 'heliosrx'

export class CustomCollectionSubscriber extends CollectionSubscriber {
  init() {
    // ...
  }

  add( newId, data ) {
    // ...
  }

  remove( oldId ) {
    // ...
  }

  set( currentId, data ) {
    // ...
  }

  once( data, exists ) {
    // ...
  }

  error( err ) {
    // ...
  }
}
```

```js
// file: ./custom-plugin/document-subscriber.js
import { DocumentSubscriber } from 'heliosrx'

export class CustomDocumentSubscriber extends DocumentSubscriber {
  init() {
    // ...
  }

  set( data ) {
    // ...
  }

  error( err ) {
    // ...
  }
}
```

### Plugin

```js
// file: ./custom-plugin/index.js

import CustomCollectionSubscriber from './custom-plugin/collection-subscriber'
import CustomDocumentSubscriber from './custom-plugin/document-subscriber'

export function install( heliosCtx, options ) {

  heliosCtx.addSubscriber( CustomCollectionSubscriber() )
  heliosCtx.addSubscriber( CustomDocumentSubscriber() )

  // ...

  heliosCtx.addUidMethod('NAME', () => {});
  heliosCtx.addGlobalStoreFunction('NAME', (ctx) => {});
  heliosCtx.addGlobalModelFunction('NAME', (ctx) => {});
  heliosCtx.addGlobalListFunction('NAME', (ctx) => {});
  heliosCtx.addGlobalApiFunctions('auth', {
    test: (ctx) => {},
  });
  heliosCtx.addStore(store)
  heliosCtx.$store
}

export function installAfter() {
  heliosCtx.$models
}
```

### Setup

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'
import customPlugin from './custom-plugin'

Vue.use(heliosRX, {

  plugins: [
    [ customPlugin, {} ],
  ],

  // ...
})
```
