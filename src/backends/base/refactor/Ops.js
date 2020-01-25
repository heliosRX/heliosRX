// -----------------------------------------------------------------------------
export function rtdbFetchAsObject ({ document, ops, resolve, reject }) {
  const unsync_callback = () => {}
  return unsync_callback
}

// -----------------------------------------------------------------------------
export function rtdbFetchAsArray ({ collection, ops, resolve, reject }) {
  const unsync_callback = () => {}
  return unsync_callback
}

// -----------------------------------------------------------------------------
export function rtdbBindAsObject ({ document, ops, resolve, reject }) {
  const unsync_callback = () => {}
  return unsync_callback
}

// -----------------------------------------------------------------------------
export function rtdbBindAsArray ({ collection, ops, resolve, reject }) {
  const unsync_callback = () => {}
  return unsync_callback
}


// rtdbFetchAsArray, rtdbFetchAsObject:

// once is always unsused! (because of promise?)

// -----------------------------------------------------------------------------
// subscribeList -> sync_list -> !fetchOnce -> rtdbBindAsArray

const ops = {
  init: () => {
    commit(HELIOSRX_INIT_VALUE)
  },
  add: (target, newId, data) => {
    // target:
    // newId:
    // data:
    commit(HELIOSRX_ARRAY_ADD)
  },
  remove: (target, oldId) => {
    // target:
    // oldId:
    commit(HELIOSRX_ARRAY_REMOVE)
  },
  set: (target, currentId, data) => {
    // target:
    // currentId:
    // data:
    commit(HELIOSRX_ARRAY_SET)
  },
  once: (target, data, exists) => {
    // target:
    // data:
    // exists:
    // (UNUSED)
  }
}
// sync_list -> !fetchOnce -> rtdbBindAsArray
const ops = {
  init: (data /*WRONG*/) => {
    // data:
    // (UNUSED)
  },
  add: (target, newId, data) => {
    // target:
    // newId:
    // data:
    // (USED)
  },
  remove: (target, oldId) => {
    // target:
    // oldId:
    // (USED)
  },
  set: (target, currentId, data) => {
    // target:
    // currentId:
    // data:
    // (USED)
  },
}

resolve() // !EMPTY!
reject(err)

// -----------------------------------------------------------------------------





// -----------------------------------------------------------------------------
// fetchList -> fetch_list -> sync_list(fetchOnce = true) -> rtdbFetchAsArray

const ops = {
  init: () => {
    // returns { target }
    // (UNUSED)
  },
  once: (target, data, exists) => {
    // target: init()
    // data: [] (?) or keyed object
    // exists: true/false
    // (UNUSED)
  }
}

resolve(data) // USED!
reject(err)
// -----------------------------------------------------------------------------




// -----------------------------------------------------------------------------
// subscribeNode -> sync_individual(fetchOnce = false) -> rtdbBindAsObject
const ops = {
  init: () => {
    // returns { target }
    // (USED!)
    commit(HELIOSRX_INIT_VALUE)
  },
  set: (target, data) => {
    // target:  init()
    // data: {}
    // (USED!)
    commit(HELIOSRX_SET)
}

resolve(data) // USED!
reject(err)
// -----------------------------------------------------------------------------




// -----------------------------------------------------------------------------
// fetchNode -> fetch_individual -> sync_individual(fetchOnce = true) -> rtdbFetchAsObject
const ops = {
  init: (data /* No data! */ ) => {
    // returns { target }
    // (UNUSED...)
  },

  set: (target, data) => {
    // target: init()
    // data: {}
    // (UNUSED)
  },
}

const ops = {
  init: () => {
    // (UNUSED)
  },
  set: (target, data) => {
    // target: init()
    // data: {}
    // (UNUSED)
  }
}

resolve(data) // USED!
reject(err)
// -----------------------------------------------------------------------------
