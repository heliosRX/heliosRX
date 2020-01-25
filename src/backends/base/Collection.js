export class Collection { // = Ref
  constructor(path, query = {}) {
    this._path = path;
    this._query = query;
  }

  // fetch({ ops , resolve, reject }) { // = fetchAsArray
  fetch( ops ) {
    /* const ops = {
      init: () => { // (UNUSED)
        // returns { target }
      },
      once: (target, data, exists) => { // (UNUSED)
        // target: init()
        // data: [] (?) or keyed object
        // exists: true/false
      }
    } */

    // const data = {};
    // resolve(data); // = once
    // reject(new Error());

    return () => { /* unsubscribe */ }
  }

  // bind({ ops , resolve, reject }) { // = bindAsArray
  bind( ops ) { // bind({ init, add, remove, set, once })
    /* const ops = {
      init: () => {
        // returns { target } ?
      },
      add: (target, newId, data) => {
        // target:
        // newId:
        // data:
      },
      remove: (target, oldId) => {
        // target:
        // oldId:
      },
      set: (target, currentId, data) => {
        // target:
        // currentId:
        // data:
      },
      once: (target, data, exists) => { // (UNUSED)
        // target:
        // data:
        // exists:
      }
    } */

    // const data = {};
    // resolve(data); // = once
    // reject(new Error());

    return () => { /* unsubscribe */ };
  }

  toLocalPath() { // = _infer_local_path_from_ref -> move lib?
    return String;
  }
}
