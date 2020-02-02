import GenericStore from './store'
// import ModelRegistry from './manager/ModelRegistry'
import { _models } from './external-deps'

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

  // const stores = ModelRegistry.getAllStores();
  const stores = _models;

  for ( var key in stores ) {

    // if ( key === '_prototype' ) {
    //   continue
    // }

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
