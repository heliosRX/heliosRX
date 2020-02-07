# Generic Store

The Generic Store is the global object that holds a Model Definition.
The only purpose of the Generic Store is to store Database instance so that we can use it in other places.
Please refer to Database to see why we need this global object in the first place.

## Instance Constructor

### Generic Store

- **`constructor( templatePath, modelDefinition, options = {} ) ⇒ GenericStore`**

Creates a new generic store.

```js
const post = new GenericStore(
  '/post/*',
  postModelDefinition
);
```

### Generic Store Constructor Options

#### templatePath

- type: `string`

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

#### modelDefinition

- type: `Object (ModelDefinition)`

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

#### options

- type: `Object`

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

| Option            | Type                | Description  |
| ----------------- | ------------------- | ------------ |
| uidMethod         | `string`            | See [UIDMethod](./database#UIDMethod)
| defaultDeleteMode | `string`            | deleteMode.SOFT or deleteMode.HARD (default), see [deleteMode](./database#DeleteMode)
| additionalProps   | `array<string>`     | Additional properties |
| enableTypeValidation   | `boolean`     | Enable validation based on (bolt) types |
| autoUnsubscribe   | `boolean`     | Automatically unsubscribe from everything a component subscribed to? (triggered on beforeDestroy) |

- TODO: Explain enableTypeValidation
- TODO: Explain autoUnsubscribe

```js
const post = new GenericStore(
  '/post/*',
  postModelDefinition,
  {
    uidMethod: UIDMethod.TIMESTAMP,
    defaultDeleteMode: deleteMode.HARD,
  }
);
```

## Instance Properties

### name
- **`name ⇒ String`**

Returns store name. This is automatically set based on the export name in the
model `config.js`.

### templatePath
- **`templatePath ⇒ String`**

Returns template path, e.g. `/user/{userId}/example/*`.

### modelDefinition
- **`modelDefinition ⇒ ModelDefinition`**

Returns model definition.

### isAbstract
- **`isAbstract ⇒ Boolean`**

Returns if the store was defined as abstract store. Abstract stores provide
abstraction by allowing you to define stores, that don't write or read data
from the database.

### isSuffixed
- **`isSuffixed ⇒ Boolean`**

Returns if the store is suffixed, which means that the id is not last item
in the template path.

```js
let example1 = new GenericStore('/user/*')
let example2 = new GenericStore('/user/*/settings')

example1.isSuffixed // > false
example2.isSuffixed // > true
```

### isReadonly
- **`isReadonly ⇒ Boolean`**

Returns if the store is a read-only store (all 'write methods' are removed from the Generic Store instance).

### definedProps
- **`definedProps ⇒ Object<string: string>`**

Returns an object of defined properties.

```js
example.with({ x: 'a', y: 'b' }).definedProps
// > { x: 'a', y: 'b' }
```

### additionalProps
- **`additionalProps ⇒ Array<string>`**

Returns an array of additional path properties. Additional properties can be
used to define properties that are not part of the `templatePath`.
See constructor.

```js
const contact = new GenericStore(
  "/user/{myUserId}/contacts/*",
  contactModelDefinition,
  { additionalProps: ['otherUserId'] }
);
// Now myUserId and otherUserId can be used as path property
example.with({ myUserId: 'a', otherUserId: 'b' }).definedProps
```

### uidMethod
- **`uidMethod ⇒ UIDMethod`**

Returns the unique id method, which defined how id's for new entries are generated.
See [UIDMethod](./database.md#UIDMethod).

### defaultDeleteMode
- **`defaultDeleteMode ⇒ DeleteMode`**

Returns the default delete mode. See [DeleteMode](./database.md#DeleteMode).

### path
- **`get path() ⇒ string`**

Returns a substituted path based on the template string and defined path properties.
Automatically sets user Id if not defined.

### parentRef
- **`get parentRef() ⇒ Reference`**

Returns Firebase Database Reference to collection that contains all items.

### rootRef
- **`get rootRef() ⇒ Reference`**

Return Firebase Database Reference to root of database.

### childRef

- **`childRef( id: string ) ⇒ Reference`**

Returns Firebase Realtime Database Reference to child with given `id`.

### schemaFields
- **`get schemaFields() ⇒ array< field: object >`**

Returns all fields defined in the schema as array.

### schemaAllFields
- **`get schemaAllFields() ⇒ array<string>`**

Returns all fields names that are defined in the schema.

### schemaRequiredFields
- **`get schemaRequiredFields() ⇒ array<string>`**

Returns all required fields names defined in the schema.

### schemaOptionalFields
- **`get schemaOptionalFields() ⇒ array<string>`**

Returns all optional fields names defined in the schema.

### subscriptions
<!-- (internal?) -->
- **`get subscriptions() ⇒ array<Subscrition>`**

Returns all subscriptions that were created by this store.
<!-- What is a subscription? -->

### rules
- **`get rules() ⇒ string`**

Return custom validation rules that can be used with Element UI. See: [Element UI Docs](https://element.eleme.io/#/en-US/component/form#custom-validation-rules).

<!--
_localDB = null;
_clones = [];
global_store_path_array = [];

get _db()
* get _db - Get reference to db (this will allow other then default databases in the future)

get _template_path_field_names()
* get _template_path_field_names - Returns all fields in the template path that need to be defined

get schemaFields()
-->

## Instance Methods

### define

- **`define( object<string:string> ) ⇒ void`**

Defines path properties for a store instance.

```js
const task_session_list = new GenericStore(
  '/project/{projectId}/user/{userId}/tasks/{taskId}/*',
  TaskSessionTypeDefinition
);

task_session_list.define({
  project: 'KrZPg8N6THOisFz_T992Zg',
  userId:  'l1X8FPc7YtbftlC31frciInV3PU2'
})

// projectId and userId now always defined
```

### with

- **`with( object<string:string> ) ⇒ GenericStore`**

Defines path properties and returns a new store instance which now refers to
a sub path:

```js
// template path: /project/{x}/post/{y}/comment/*
example.with({ x: 'a', y: 'b' }).add({ ... })
// A new entry is added to /project/a/post/b/comment/-Lw_jEwrxiM6d2fS0n2m
```

### previewPath

- **`previewPath( [id: string] ) ⇒ String`**

Generate a path preview for a given it:

```js
// template path: /project/{x}/post/{y}/comment/*
example.with({ x: 'a', y: 'b' }).previewPath('c')
//> /project/a/post/b/comment/c
example.with({ x: 'a', y: 'b' }).previewPath()
//> /project/a/post/b/comment/{id}
```

### setName
<!-- (INTERNAL?) -->

- **`setName( string ) ⇒ void`**

Set stores name

### generateId

- **`generateId() ⇒ string`**

Generates a new unique identifier based on the selected method in the constructor.

### reset

- **`reset( level: numeric ) ⇒ void`**

Resets the template path to it's initial state, without substitutions.


<!--
_clone()
_get_uid()
* _get_uid - Generates a new unique identifier based on the selected method in the constructor

_validate_id( id )
* _validate_id - Checks if a given id is valid

_define_user()
* _define_user - Define user (userId/uid) based on default value

previewPath( id )
 * previewPath - Generate a path preview for a given it

define( target, props )
* define - Defines id's in the template string (INTERNAL)

* @param {GenericStore} target - Target of replacement (usually this)
* @param {object} props - Id's that should be replaced.

* @example <caption>Example usage of method1.</caption>

_check_required_fields( data )
* _check_required_fields - Check if all required fields exists according to schema

_check_required_create_arg( data )
* _check_required_fields - Check if create inputs are present
*                          Required by user is not the same a required by DB!

_validate_schema( data, is_update )
* _validate_schema - Validates against the current schema
* @param  {type} data      data to validate
* @param  {type} is_update is the data used for updating and existing item?

_bind_rtdb({ key, ref, ops, bindAsArray })
* _bind_rtdb - Firebase binding
*
* Adapted from:
* see: https://github.com/vuejs/vuefire/blob/feat/rtdb/packages/vuexfire/src/rtdb/index.js

* @param {{ key, ref, ops, bindAsArray }} obj - config
* @param {string} obj.key                - Key where the data is stored locally
* @param {firebase.database.ref} obj.ref - Firebase Realtime Database reference
* @param {type} obj.ops                  - operations {init, add, remove, set, set_sync}
* @param {boolean} obj.bindAsArray.      - bind as list (true), bind as document (false)

_fetch_rtdb({ key, ref, ops, bindAsArray })
* _fetch_rtdb - Firebase binding

_unbind_rtdb({ key })
* _unbind_rtdb - Unbind firebase from location

_bind_firestore( { state, commit, key, ref, ops } )
_unbind_firestore({ commit, key })
-->

## Instance Methods (Writing)

### add
- **`add( overwrite_data <, new_id: string> <, options: object> ) ⇒ Promise<id: string>`**

Adds a new item to the database. Returns a promise, which will then resolve
to the id of the newly created item. `overwrite_data` is passed to the model
definition has a `create` function. If `new_id` is provided it will be used
as the id for the new entry. The UIDMethod is ignored. Valid options are:

| Option            | Type                | Description  |
| ----------------- | ------------------- | ------------ |
| directWrite       | `boolean`           | Don't pass `overwrite_data` to the `create` function of the model definition, but instead write the data directly to the database.


```js
$models.example.add({ title: 'Name' })
// or
$models.example.add({ title: 'Name' }).then(id => { ... })
```

### update
- **`update(id: string, data: object<string: any>) ⇒ Promise`**

Update one or many fields. First argument is the id of the entry (the `*` in
  the `templatePath`). Second argument is the data the should be updated. It
  is possible to futher nest data with '/':

```js
// Update single fields
$models.example.update(id, { key: 'value' })
$models.user_settings.update({ 'address/zipcode': 12345 })
```

```js
// Update multiple fields
$models.example.update(id, { key1: value1, key2: value2 })
```

### remove
- **`remove(id: string <, soft_delete: DeleteMode> ) ⇒ Promise`**
- **`remove(ids: array<string> <, soft_delete: DeleteMode> ) ⇒ Promise`**

Deletes one or many an entry at the data location

* `id` - id the item or arrary of ids of items that should be deleted
* `soft_delete` - optional: Overwrite default behaviour for delete mode

```js
$models.example.remove(id)
$models.example.remove(id, true) // Soft delete
$models.example.remove([id1, id2, id3], true) // Delete list of entries
```

### reorder
- **`reorder(sortidxList: object<string: string> <, options = {}>) ⇒ Promise`**
- **`reorder(sortidxList: array<string> <, options = {}>) ⇒ Promise`**

Change the order of items. This is achieved through a special field called `sortidx`.
<!-- TODO: Implement intelligent sortidx update -->

- `sortidxList` - Batch should be an array or array of objects

```js
$models.example.reorder([ id1, id2, ... ])
$models.example.reorder([{ id: id1, sortidx: 1 }, { id: id2 sortidx: 2 }, ...])
```

Passing an object as first argument is especially useful, when passing an
existing collection of items.

```js
// TODO
// ...
$models.example.reorder(updated_commitment_list)
```

### restore
- **`restore( id ) ⇒ Promise`**

Restores a deleted entry at the data location (the `deleted` field is set to false).

```js
$models.example.restore('-Lw_jEwrxiM6d2fS0n2m')
```

### copy
- **`copy(id, contextA, contextB) ⇒ Promise`**

Copy data between nodes (same as move, but keeps original and generates new id)

- `id` (string) - id of source object
- `contextA` (object) - props of the source path
- `contextB` (object) - props of the destination path

```js
// copy a task from /user/A/task/234 to /user/B/task/234
$models.task.copy('234',
  { userId: 'A' },
  { userId: 'B' }
);
```

```js
// copy a comment from /user/A/task/234/comment/789 to /user/B/task/234/comment/789
$models.comment.copy(789,
  { userId: 'A', taskId: 234 },
  { userId: 'B', taskId: 234 }
);
```

### move
- **`move(id, contextA, contextB, { keepOriginal = false, keepId = true } = {}) ⇒ Promise`**

Move data between nodes

- `id`: {string} - Id of the object that should be moved
- `contextA`: {object} - props of the source path
- `contextB`: {object} - props of the destination path
- `options`: Options

| Option            | Type                | Description  |
| ----------------- | ------------------- | ------------ |
| keepOriginal      | `boolean`           | Keep original? (copy)
| keepId            | `boolean`           | Keep original id or generate a new id?

```js
$models.example.move(234,
  { userId: 'A' },
  { userId: 'B' }
)
// or
$models.example.move(id,
  { userId: 'A', taskId: 234 },
  { userId: 'B', taskId: 234 },
  { keepOriginal: true, keepId: false }
)
```

<!-- TODO: support batch move (as transaction!) -->

### transaction
- **`transaction( id: string, prop: string, transaction: string, value: numeric ) ⇒ Promise`**

Performs a transaction on the realtime database.
<!-- TODO: ENUM TransactionType -->

- `id`: {string} - Id of the object that should be moved
- `prop`: {string} - props of the source path
- `transaction`: {string|function} - Predefined transaction are `inc` and `dec`. Alternatively a callback can be passed.
- `value`: If `inc` or `dec` are used this defines by which amount a field is
incremented or decremented. Default value is `1`.

```js
$models.example.transaction( <childId>, <prop>, <transaction> )
$models.example.transaction( id, 'coins', coins => coins * 2 )
$models.example.transaction( id, 'coins', 'inc', 100 )
$models.example.transaction( id, 'coins', 'inc' ) // default: increment by 1
```

### new
- **`new() ⇒ GenericModel`**

Create empty model from schema (without calling create function)
<!-- new + write = new_id + update -->

### newFromTemplate
- **`newFromTemplate( data: object<string:any> <, optional_data<string:any>> ) ⇒ GenericModel`**

Create empty model from create function
<!-- newFromTemplate + write = add -->

### newFromData
- **`newFromData( data: object<string:any> <, make_dirty:boolean> ) ⇒ GenericModel`**

<!-- TODO: make_dirty: default: false -->

### empty
- **`empty( data: object<string:any> <, optional_data<string:any>> ) ⇒ object<string:any>`**

Create empty payload from `schema.create()`. This method WILL only create
an Object, not a GenericModel. In most cases, you want to use
`newFromTemplate` instead

<!--
### Internal
```js
__write_mixin_init( reset = false )
_convert_moment_objects( payload )
```
-->

## Instance Methods (Reading)

### subscribeList
- **`subscribeList( <idList: array<string>> <, option:object>) ⇒ GenericList`**

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

```js
return $models.example.subscribeList();
return $models.example.subscribeList([ id1, id2, id3 ]);
```

<!--
```js
$models.example.subscribeList(idList = [], {
  noSync = false,
  noReactiveGetter = false,
  createModelFromExistingCache = false,
  queryParams = null
} = {})
```
-->

### subscribeNode
- **`subscribeNode( <id: string> <, option:object>) ⇒ GenericModel`**

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

```js
return $models.example.subscribeNode( id );
```

<!--
```js
$models.example.subscribeNode( id, {
  noSync = false,
  noReactiveGetter = false,
  createModelFromExistingCache = false
} = {} )
```
-->

* noSync = Return from cache


### subscribeQuery
- **`subscribeQuery( <query:QueryDefinition> <, option:object>) ⇒ GenericList`**

```js
subscribeQuery(query, options = {})
```

| Option            | Type                | Description  |
| ----------------- | ------------------- | ------------ |
| key               | `string`            | '*' or undefined
| value             | `any`               |
| limit             | `numeric`           |
| startAt           | `string`            |
| endAt             | `string`            |

<!--
* @param {object} options
* @param {object} options.noSync = false
* @param {object} options.noReactiveGetter = false
* @param {object} options.createModelFromExistingCache = false
-->

```js
this.$models.example.subscribeQuery({
  key: 'createdAt',
  startAt: 123456789,
  limit: 100
});
```
### fetchList

- **`fetchList( <option:object> ) ⇒ GenericList`**

```js
fetchList({
  noReactiveGetter = false,
  // customRef = null,
  queryParams = null,
} = {})
```

### fetchNode
- **`fetchNode( <id:string>, <option:object> ) ⇒ GenericModel`**
```js
fetchNode(id, { noReactiveGetter = false } = {})
```

### fetchQuery
- **`fetchQuery( <query:QueryDefinition> <, option:object> ) ⇒ GenericList`**
```js
fetchQuery(query, options)
```

---

### getList
- **`getList( <idList:array<string>> <, option:object>) ⇒ GenericList`**
```js
getList( idList, { noReactiveGetter = false } = {} )
```

### getNode
- **`getNode( <id:string> <, option:object>) ⇒ GenericModel`**
```js
getNode( id, { noReactiveGetter = false } = {} )
```

### getData
- **`getData( <id:string> <, option:object>) ⇒ Object<string:any>`**

Get raw state from registry.

- getData() -> get reference to list of data
- getData(child_id) -> get reference to an item in the list

```js
getData(id = null, safe = false)
```

```js
let list = $models.example.getData()
let obj = $models.example.getData('234')
```

### exists
- **`exists( <id:string> ) ⇒ boolean`**

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

```js
exists(id = null)
```

### getRegistryState
- **`getRegistryState() => object`**

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

### getAllSyncedPaths
- **`getAllSyncedPaths() => object<string:string>`**

::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
:::

<!--
### More

```js
buildQueryRef({
  key = undefined,
  value = undefined,
  limit = undefined,
  startAt = undefined,
  endAt = undefined,
})
queryHash( query )
```
-->

<!--
```js
unsync( id = null, { clean_up = false } = {} )
* unsync - Stop syncing.
*
* @param {uuid} id - Id
* @param {{ clean_up }} obj  description
* @param {Boolean} obj.clean_up - Clean up?

unsyncAll({ clean_up = false } = {})
* unsyncAll - Stop sycning all subscriptions of this store.
*
* @param {{ clean_up }} obj
* @param {Boolean} obj.clean_up - Clean up?

_fetch_individual( id, { overwriteKey = false, customOps = {} } = {} )
* _fetch_individual - fetch an individual item of the collection
*
* @param  {uuid} id                            description
* @param  {{ overwriteKey, customOps }} obj
* @param  {Boolean} obj.overwriteKey - description
* @param  {Object} obj.customOps - description

_fetch_list( { overwriteKey = false, customOps = {}, customRef = null } = {} )
* fetch - fetch all items in this collection
*
* @param  {{ overwriteKey, customOps, customRef }} obj - description
* @param  {Boolean} obj.overwriteKey - description
* @param  {Object} obj.customOps - description
* @param  {Object} obj.customRef - null

_sync_individual( id, { overwriteKey = false, fetchOnce = false, customOps = {} }  = {} )
* _sync_individual - sync an individual item of the collection
* @param  {type} id - id of node
* @param  {{ overwriteKey, fetchOnce, customOps obj
* @param  {Boolean} obj.overwriteKey - description
* @param  {Boolean} obj.fetchOnce - description
* @param  {Object} obj.customOps - description

_sync_list( { overwriteKey = false, fetchOnce = false, customOps = {}, customRef = null }  = {} )
* _sync_list - sync entire collection (also track child added, child removed)
*
* @param  {{ overwriteKey, fetchOnce, customOps, customRef }} obj
* @param  {Boolean} obj.overwriteKey  - false
* @param  {Boolean} obj.fetchOnce - false
* @param  {Object} obj.customOps - {}
* @param  {Object} obj.customRef - null
*
*  Returns a promise, that will resolve, when all items are ready

resetGlobalInstanceCache()
```
-->


<!--
```js
_read_mixin_init()
_infer_local_path_from_ref( ref )
* _infer_local_path_from_ref - Converts a firebase ref into a "walkable" path
*
* @param  {type} ref description
*
* @return {type}     description
*
*   Converts
*   "/goal/{goalId}/user_list/{uid}/task_details/ * /task_subscription",
*   to
*   "goal.{goalId}.user_list.{uid}.task_details.{id}.task_subscription",
*   which refers to
*   state.res.goal[ goalId ].user_list[ uid ].task_details[ ].task_subscription
*
*   TODO:
*   state.res.goal[ goalId ].children.user_list[ uid ].children.task_details[ ].task_subscription.data

_item_matches_query(query, item)
_create_context()
_match_all_existing_synced_queries( requested_path, only_active = true )
_match_existing_synced_nodes( requested_path, subnodes_can_match_lists = false)
_get_sync_state( path  )
```
-->

## Static Methods

### setDefault

- **`set setDefault( key: string, value: any )`**

Sets default options for new stores.

```js
GenericStore.setDefault( 'allowEmptySchema', false );
```

Available options are:

```js
const defaultStoreOptions = {
  isAbstract:           false,
  uidMethod:            UIDMethod.PUSHID,
  additionalProps:      [],
  defaultDeleteMode:    DeleteMode.HARD,
  enableTypeValidation: true,
  autoUnsubscribe:      true,
  isReadonly:           false,
  allowEmptySchema:     true,
};
```

### defaultUserId

- **`set defaultUserId( value: string )`**

Sets the default user Id. If set, any `{uid}` or `{userId}` will
automatically get substituted with the default user Id.

```js
GenericStore.defaultUserId = 'Qz3p2fpvTyeje5As3WDfgQtTCEK2';
```

- **`get defaultUserId() ⇒ string`**

Returns the default UserId for all stores

A good time to set the user id is after the user has been authenticated:

```js
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User authenticated and is signed in
    GenericStore.defaultUserId = user.uid;
  } else {
    // User was signed in and now signed out
    GenericStore.resetState();
  }
});
```

- **`resetState() ⇒ void`**

Reset stores. Should be called when the user logs out, in order to remove
any stored user information from the state.
