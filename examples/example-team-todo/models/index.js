import GenericStore from '@/generic_api/lib/generic_store/GenericStore'
import * as MyGenericStores from './config.js'

// TODO: implement HMR here for models

// INFO: Needed for Cloud functions
for ( let storeName in MyGenericStores ) {
  // eslint-disable-next-line import/namespace
  MyGenericStores[ storeName ].setName( storeName )
}

export default MyGenericStores;

// ------------------------------------------------------------------------ MISC
// TODO: Move to generic api folder?

export { GenericStore };

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

  for ( var key in MyGenericStores ) {
    // if ( key === '_prototype' ) { // ???
    //   continue
    // }

    // eslint-disable-next-line import/namespace
    let model = MyGenericStores[ key ];
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

/*
export function getGlobalSubscriptionList() {
  let subscriptionList = {}
  Object.keys( MyGenericStores ).map(store_key => {
    // TODO: maybe return sync state instead of unsubscribe calback
    subscriptionList[ store_key ] = MyGenericStores[ store_key ].subscriptions || null
  })
  return subscriptionList
}
*/
