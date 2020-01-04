// TODO: Load models based on path

// ------------------------------------------------------------------------ MISC
// TODO: Move to generic api folder?

import GenericStore from './store/';
import StoreManager from './manager';
// export { GenericStore };

/*
import * as MyGenericStores from './config.js'

for ( let storeName in MyGenericStores ) {
  // eslint-disable-next-line import/namespace
  MyGenericStores[ storeName ].setName( storeName )
}

export default MyGenericStores;
*/

export function setDefaultDB(db) {
  GenericStore.setDefaultDB(db)
}

export function setDefaultUser(id) {
  if ( GenericStore.defaultUserId !== null ) {
    throw new Error('Call resetGenericStores before setting the default user id')
  }
  GenericStore.defaultUserId = id;
}

export function resetGenericStores( unsubscribe = true ) {

  GenericStore.resetState();
  // GenericStore.defaultUserId = null;

  const stores = StoreManager.getAllStores();

  for ( var key in stores ) {
    // if ( key === '_prototype' ) { // ???
    //   continue
    // }

    // eslint-disable-next-line import/namespace
    let model = stores[ key ];
    let sublist = model.subscriptions;

    /* reset models */
    model.reset();

    /* unsubscribe */
    if ( unsubscribe && sublist ) {
      Object.keys(sublist).forEach(sub => {
        let callback = sublist[ sub ];
        console.log("Calling unsubscribe for", key, ":", sub);
        callback();
      })
    }
  }
}
