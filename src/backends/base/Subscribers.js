class CollectionOps { // = CollectionSubscriber
  init() {
    // returns { target } ?
  }

  // add(target, newId, data) { // (sync)
  add(newId, data) { // (sync)
    // target:
    // newId:
    // data:
  }

  // remove(target, oldId) { // (sync)
  remove(oldId) { // (sync)
    // target:
    // oldId:
  }

  // set(target, currentId, data) { // (sync)
  set(currentId, data) { // (sync)
    // target:
    // currentId:
    // data:
  }

  // once(target, data, exists) { // (fetch)
  once(data, exists) { // (fetch)
    // target:
    // data:
    // exists:
  }

  error( err ) { // NEW
    // err:
    console.error(err)
  }
}

class DocumentOps { // = DocumentSubscriber
  init() {
    // returns { target }
  }

  // set(target, data) { // (sync)
  set(data) { // (sync)
    // target:  init()
    // data: {}
  }

  error( err ) { // NEW
    // err:
    console.error(err)
  }
}

function MergeOps ( ...args ) { // TODO: move to util?
  return new CollectionOps();
}

export { CollectionOps, DocumentOps, MergeOps };
