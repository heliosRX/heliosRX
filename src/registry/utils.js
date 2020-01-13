import { _Vue as Vue } from '../install'

const log = (...args) => {}

/**
 *
 * @param {any} o
 * @returns {boolean}
 */
export function isObject (o) {
  return o && typeof o === 'object' && !Array.isArray(o);
}

/**
 *
 * @param {any} o
 * should be o is Date https://github.com/Microsoft/TypeScript/issues/26297
 * @returns {boolean}
 */
export function isTimestamp (o) {
  return o.toDate
}

/**
 *
 * @param {*} o
 * @returns {boolean}
 */
export function isRef (o) {
  return o && o.onSnapshot
}

/**
 * @param {function} fn - Function to be called once
 * @param {Object} argFn
 * @returns {any}
 */
export function callOnceWithArg (fn, argFn) {
  let called
  return () => {
    if (!called) {
      called = true
      return fn(argFn())
    }
  }
}

/**
 * walkGet
 *
 * first item in path MUST exist
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any} or undefined if path not found
 */
export function walkGet (obj, path) {
  return path.split('.').reduce((target, key) => target[key], obj)
}

/**
 * walkGet
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any} or {} if path not found
 */
export function walkGetObjectSave (obj, path) {
  return path.split('.').reduce((target, key) => target[key] || {}, obj)
}

export function walkGetPropSave (obj, path) {
  // return path.split('.').reduce((target, key) => target[key] || {}, obj)

  const keys = ('' + path).split('.')
  const key = keys.pop()
  const target = keys.reduce((target, key) => target[key] || {}, obj)
  return target[ key ]
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @param {any} value
 * @returns
 *
 * @exammple
 * let obj = { a: { b: { c: [1,2,3,4] } } }
 *
 * walkSet( obj, 'a.b.c.1', 'test1')
 * > obj = { a: { b: { c: ['test2',2,3,4] } } }
 *
 * walkSet( obj, 'a.b.c', 'test2')
 * > obj = { a: { b: { c: "test2" } } }
 *
 * walkSet( obj, 'a.b.c.d', 'test3')
 * --> error .splice of undefined
 * > NOT: obj = { a: { b: { c: ['test',2,3,4], d: "test3" } } }
 *
 */
export function walkSet (obj, path, value) {
  // path can be a number
  const keys = ('' + path).split('.') // keys = 'a.b.c' => ['a', 'b', 'c']
  const key = keys.pop() // key = 'c'
  const target = keys.reduce((target, key) => target[key], obj) // object at location obj['a']['b']
  return target.splice // is array?
    ? target.splice(key, 1, value) // in array target replace with 'value' at index 'key'
    : (target[key] = value)  // set target[ key ] to 'value'
}

/**
 *
 */
export function walkDelete (obj, path) {
  const keys = ('' + path).split('.')
  const key = keys.pop()
  const target = keys.reduce((target, key) => target[key], obj)
  delete target[ key ]
  // Vue.delete( target, key ) //?
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @param {object} data
 * @returns
 *
 * @exammple
 * let obj = { a: { b: { p1: 'A', p2: 'B', p3: { p31: 'C'}, _tasks: {} } } }
 * let data = { p1: 'A*', p3: { p31: 'C*', p32: 'D*' } } // p2 has been deleted, p32 was added
 * walkSetMerge( obj, 'a.b', data)
 * > obj = { a: { b: { p1: 'A*', p3: { p31: 'C*', p32: 'D*'}, _tasks: {} } } }
 *
 * let obj = { a: { b: { ... } } }
 * walkSetMerge( obj, 'a.c', data)
 * > obj = { a: { b: { ... }, c: data } }
 */
export function walkSetVueProp (obj, path, data) {
  // TODO: What if path does not exist? option -p ?
  const keys = ('' + path).split('.') // keys = 'a.b' => ['a', 'b'] (e.g a = 'goal', b = 'ASD1S4DA5S4D3')
  const key = keys.pop() // key = 'b'
  // const target = keys.reduce((target, key) => target[key], obj) // object at location obj['a']

  const target = keys.reduce((target, key) => {
    if ( !( key in target ) ) {
      Vue.set( target, key, {} )
    }
    return target[key]
  }, obj)

  /* if ( !( key in target ) ) {
    target[ key ] = data;
    return
  } */

  // TODO: Besserer fehler als:
  // Uncaught (in promise) TypeError: Cannot read property 'res' of undefined
  //  at eval (utils.js?7e75:109)

  /* Backup everything that starts with '_' */
  /*
  let backup = {};
  Object.keys(target[ key ])
        .filter( k => k.startsWith('_') )
        .forEach( k => { backup[ k ] = target[ key ][ k ] } )
  */

  /* Merge data with backup */
  // target[ key ] = Object.assign({}, data, backup) --> geht nicht!!!

  Vue.set( target, key, data )
  return target[ key ];
}

/* function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
} */

/**
 * Deep merge two objects.
 * @param {Object} target - Target
 * @param {Object} data - Data to merge
 * @param {Boolean} delete_missing_fields - Delete fields that are missing in data?
 */
export function deepMergeVue( target, data, delete_missing_fields = true ) {
  let map = delete_missing_fields ? Object.assign({}, target) : {}
  for ( let prop in data ) {
    let target_is_object = null
    let source_is_object = null
    if (target) {
      target_is_object = isObject(target[ prop ]);
    }
    if (data) {
      source_is_object = isObject(data[ prop ]);
    }

    if ( target_is_object && source_is_object ) {
      deepMergeVue( target[ prop ], data[ prop ], delete_missing_fields )
    } else {
      /* All other cases we can safely overwrite the data in target */
      Vue.set( target, prop, data[ prop ] )
    }

    delete map[ prop ]
  }
  // log("GENS:DEEPMERGE] Remaining fields", map, data);
  for ( let prop in map ) {
    log("[GENS:DEEPMERGE] Deleting <", prop, ">");
    Vue.delete( target, prop )
  }
  return map
}

export function walkSetAndMerge (obj, path, data) {
  // TODO: What if path does not exist? option -p ?
  const keys = ('' + path).split('.') // keys = 'a.b' => ['a', 'b'] (e.g a = 'goal', b = 'ASD1S4DA5S4D3')
  const key = keys.pop() // key = 'b'
  const target = keys.reduce((target, key) => { // object at location obj['a']
    if ( !( key in target ) ) {
      Vue.set( target, key, {} )
    }
    return target[key]
  }, obj)

  if ( key in target ) {
    // INFO: Sollte nicht mehr auftreten - trozdem warning ausgeben
    // TODO: What about deleting items?
    log("[GENS:INIT] Existing data found -> Performing deep merge at '",
      key, "' of target", target, "with source", data);

    if ( '.value' in data && data['.value'] === null ) {
      log("[GENS:INIT] New data is null, deleting node at <", key, ">");
      Vue.delete( target, key );
      return
    }

    /* for ( let prop in data ) {
      Vue.set( target[key], prop, data[ prop ] )
    } */
    deepMergeVue( target[key], data, true )

  } else {
    Vue.set( target, key, data )
  }

  return target[ key ];
}

/**
 * Find the index for an object with given key.
 *
 * @param {array} array
 * @param {string} key
 * @return {number}
 */
export function indexForKey (array, key) {
  for (let i = 0; i < array.length; i++) {
    if (array[i]['.key'] === key) return i
  }

  return -1
}
