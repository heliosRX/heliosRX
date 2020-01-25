export class Document { // = Ref

  constructor(path) {
    this.path = path;
  }

  update( payload ) {
    // !!!!
    // { [new_id]: payload }

    const new_id = 1;
    return Promise.resolve(new_id)
  }

  remove() {

    const new_id = 1;
    return Promise.resolve(new_id)
  }

  transaction(transaction: Function) {
    return Promise.resolve({ committed: true })
  }

  // addSubscriber() {} ?? vs. mergeOps

  // fetch({ document, ops, resolve, reject }) { // = fetchAsObject
  fetch( ops ) { // = fetchAsObject
    /* const ops = { // (UNUSED)
      init: () => {
        // returns { target }
      },
      set: (target, data) => { // (UNUSED)
        // target: init()
        // data: {}
      },
      error: (err) => { // NEW
      }
    } */

    const data = {};
    ops.init(data)
    // resolve(data); // = set
    // reject(new Error());

    return () => { /* unsubscribe */ }
  }

  // bind({ document, ops, resolve, reject }) { // = bindAsObject
  bind( ops ) { // = bindAsObject
    /* const ops = {
      init: () => {
        // returns { target }
      },
      set: (target, data) => {
        // target:  init()
        // data: {}
      }
    } */

    // const data = {};
    // resolve(data); // = set
    // reject(new Error());

    return () => { /* unsubscribe */ }
  }

  toLocalPath() { // = _infer_local_path_from_ref -> move lib?
    return String;
  }
}
