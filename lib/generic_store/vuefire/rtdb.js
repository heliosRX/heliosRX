// -----------------------------------------------------------------------------
export function rtdbFetchAsObject ({ document, ops, resolve, reject }) {
  const { target } = ops.init();

  document.once('value', snapshot => {

    // INFO: This is not called, when the data does not exist

    let data = snapshot.val();
    if ( !snapshot.exists() ) {
      data = { '.exists': false }
    }
    ops.set( target, data )
    resolve( data );

  }, err => {
    if ( err ) {
      reject(err)
    }
  })

  return () => {}
}

// -----------------------------------------------------------------------------
export function rtdbFetchAsArray ({ collection, ops, resolve, reject }) {
  const { target } = ops.init()

  collection.once('value', snapshot => {
    let data = snapshot.val()
    ops.once(target, data, snapshot.exists());
    resolve(data);
  }, err => {
    if ( err ) {
      reject(err)
    }
  })

  return () => {}
}

// -----------------------------------------------------------------------------
export function rtdbBindAsObject ({ document, ops, resolve, reject }) {
  /* INFO: Single value is not supported */

  // const target = {};
  const { target } = ops.init();

  const listener = document.on(
    'value',
    snapshot => {
      // let target = snapshot.ref.path.toString();
      let data = snapshot.val();

      // TODO: Handle snapshot.exists
      if ( !snapshot.exists() ) {
        data = { '.exists': false }
      }

      ops.set( target, data )
      resolve( data ); // Only one argument allowed!
    }, err => {
      if ( err ) {
        reject(err)
      }
    }
  )

  return () => {
    document.off('value', listener)
  }
}

// -----------------------------------------------------------------------------
export function rtdbBindAsArray ({ collection, ops, resolve, reject }) {
  // const target = {}; // []
  const { target } = ops.init()

  // TODO: Handle snapshot.exists

  collection.once('value', snapshot => {
    ops.once(target, snapshot.val(), snapshot.exists());
    resolve();
  }, err => {
    if ( err ) {
      reject(err)
    }
  })

  const childAdded = collection.on(
    'child_added',
    (snapshot, prevKey) => {
      // TWE: We're not really intersted in the order, since we ensure order via sortidx
      // TODO: Add sortidx for ordered queries
      ops.add(target, snapshot.key, snapshot.val())
    },
    reject
  )

  const childRemoved = collection.on(
    'child_removed',
    snapshot => {
      ops.remove(target, snapshot.key)
    },
    reject
  )

  const childChanged = collection.on(
    'child_changed',
    snapshot => {
      ops.set( target, snapshot.key, snapshot.val() )
    },
    reject
  )

  const childMoved = collection.on( // ACHTUNG: Das wird auch für orderByChild genutzt
    'child_moved',
    (snapshot, prevKey) => {
      // const index = indexForKey(target, snapshot.key)
      // const oldRecord = ops.remove(target, index)[0]
      // const newIndex = prevKey ? indexForKey(target, prevKey) + 1 : 0
      // ops.add(target, newIndex, oldRecord)

      // TODO: Update target.sortidx
      // oldKey = prevKey
      // newKey = snapshot.key
      // ops.order(  )
    },
    reject
  )

  return () => {
    collection.off('child_added',   childAdded)
    collection.off('child_changed', childChanged)
    collection.off('child_removed', childRemoved)
    collection.off('child_moved',   childMoved)
  }
}
