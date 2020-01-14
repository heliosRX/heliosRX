import * as GenericStores from './config.js'

for ( let storeName in GenericStores ) {
  GenericStores[ storeName ].setName( storeName )
}

export default GenericStores;
