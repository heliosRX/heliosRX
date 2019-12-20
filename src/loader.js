// TODO: Load models based on path

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
