class Ref {

  path = ""

  constructor(path) {
    this.path = path;
  }

  push() { // -> move to Db.PushId()
    const PUSHID = 1;
    return PUSHID;
  }

  update( payload ) {
    // !!!!
    return Promise
  }

  remove() {
    return Promise
  }

  transaction(transaction: Function) {
    return Promise

  }

  child() {

  }

  fetchAsObject ({ document, ops, resolve, reject }) {}
  bindAsObject ({ document, ops, resolve, reject }) {}

  fetchAsArray ({ collection, ops, resolve, reject }) {}
  bindAsArray ({ collection, ops, resolve, reject }) {}
}

class Db {
  ref( path = null ) {
    return new Ref(path);
  }
  // generateId()
}

export default {
  childRef(id) {
    return this._db.ref( this.path.replace(/\{id\}/g, id) );
  },

  get parentRef() {
    return this._db.ref( this.path.split('{id}').shift() );
  },

  get rootRef() {
    return this._db.ref();
  },

  // READ MIXIN

  buildQueryRef({
    key = undefined,
    value = undefined,
    limit = undefined,
    startAt = undefined,
    endAt = undefined,
  }) {
  },

  _infer_local_path_from_ref( ref ) {
  },
}
