import * as MyGenericStores from './config.js'

for ( let storeName in MyGenericStores ) {
  // eslint-disable-next-line import/namespace
  MyGenericStores[ storeName ].setName( storeName )
}

export default MyGenericStores;
