# Migration to plugin system

- Move
  buildQueryRef
  _infer_local_path_from_ref


- resolve, reject => can be done based on ops!
- Don't pass target to ops

```js
var ref = this.rootRef;
// Generate a reference to a new location and add some data using push()
var newItemRef = ref.push();

return this.rootRef.update(payload)
return this.rootRef.update(payload).then(() => propsB['id'])

return this.parentRef.update({ [newPostKey]: payload }).then(() => new_id);
return this.parentRef.update({ [new_id]: payload }).then(() => new_id);
return this.parentRef.update(payload);

return this.childRef( new_id ).update(payload).then(() => new_id);
return this.childRef( id ).update(payload);
return this.childRef( id ).remove();
return this.childRef( id ).transaction(transaction).then((result) => {

this.childRef( id ).ref.child(prop) // REPLACE !
this.childRef( id ).path.toString()

return this._db.ref(pathA).once('value').then(snapshot => {// REPLACE !
let path = ref.path.toString()

// Read

const listener = document.on('value', snapshot => { }, err => { })
document.once('value', snapshot => { }, err => { })
document.off('value', listener)

collection.once('value', snapshot => { }, err => { })

const childAdded   = collection.on( 'child_added', (snapshot, prevKey) => { }, reject
const childRemoved = collection.on( 'child_removed', snapshot => { }, reject )
const childChanged = collection.on( 'child_changed', snapshot => { }, reject )
const childMoved   = collection.on( 'child_moved', (snapshot, prevKey) => { }, reject )

collection.off('child_added',   childAdded)
collection.off('child_changed', childChanged)
collection.off('child_removed', childRemoved)
collection.off('child_moved',   childMoved)
```
