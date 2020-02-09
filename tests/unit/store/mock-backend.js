export class MockRef {
  constructor( path ) {
    this.path = path;
  }

  push() {
    return { key: 1 }
  }

  update() {
    console.log("update")
    return Promise.resolve(-1)
  }

  remove() {
    console.log("remove")
    return Promise.resolve(-1)
  }

  once() {
    console.log("once")
    return Promise.resolve(-1)
  }

  get ref() {
    return {
      child() {
        console.log("child")
        return Promise.resolve(-1)
      }
    }
  }

  transaction() {
    console.log("transaction")
    return Promise.resolve(-1)
  }
}

export class MockBackend {
  ref( path = null ) {
    console.log("ref", path)
    return new MockRef( path );
  }
}

/*
return this._db.ref( this.path.replace(/\{id\}/g, id) );
return this._db.ref( this.path.split('{id}').shift() );
return this._db.ref();
return this._db.ref(pathA).once('value').then(snapshot => {
*/
