# Writing data

In general there are two ways to get data written into your database:

1. Create a `GenericModel` and write it's content with `.write()`
2. Using the "global" API of the store

## Writing data with a model

Beside `subscribeNode()`, `fetchNode()`, etc. there are three ways to create a
new model from a `GenricStore`.
Assuming the following schema

```js
export default {
  create({ hasText }) {
    return {
      title: hasText ? 'Empty task' : ''
    }
  },
  fields: {
    title:     { type: 'String', required: true },
    createdAt: { type: 'ServerTimestamp' },
    isDone:    { type: 'Boolean' },
  },
};
```

you can create and write a new task like this:

```js
let task1 = this.$models.task.new()
task1.title = "My title"
task1.write()

let task2 = this.$models.task.newFromTemplate({ hasText: true })
task2.write()

let task3 = this.$models.task.newFromData({ title: 'Empty task' })
task3.write()
```

All three variants will create the same result.

| Methods                 | Description
|-------------------------|--------------------------------------------------
| `new()`                 | Creates an empty model
| `newFromTemplate()`     | Creates an model calling the `create()` function
| `newFromData()`         | Creates an model from data


The create function can also be defined with a second argument for optional inputs:

```js
export default {
  create({ hasText }, optional) {
    return {
      title:   hasText ? 'Empty task' : ''
      isDone: 'isDone' in optional ? optional.isDone : null,
    }
  },
  // ...
};
```

The first argument of `newFromTemplate` will always be passed as both first AND second
argument to `create()`:

```js
let task = this.$models.task.newFromTemplate({ hasText: true, isDone: true })
```


| Model Methods | Description
|---------------|--------------------------------------------------
| `clone()`     | Required when data is changed locally. Creates a clone of the GenericModel.
| `write()`     | Write dirty fields to database (usually requires `clone()`)
| `update()`    | Directly update fields in the database. Syntax:<br>`task.update(id, { isDone: true })`


## Writing data with the global API

| Store Methods            | Description
|--------------------------|-------------------------------------------------------------
| `add(data)`              | Add a node to the database<br >(will call `create( data )` like `newFromTemplate` does)
| `update(id, data)`       | Update node with `id` and `data` (Object)
| `remove(id/ids, mode)`   | Delete node with `id` (or list of `id`s)<br>`mode` is either `DeleteMode.SOFT` or `DeleteMode.HARD`
| `restore(id)`            | Restore a node that was deleted with `DeleteMode.SOFT`
| `reorder(ids)`           | Reorders data by updating the field `sortidx` (see next section)
| `copy(id, ctxA, ctxB)`   | Copies a node with `id` from context A to context B<br>(see next section)
| `move(id, ctxA, ctxB)`   | Same as copy, but delete original
| `transaction(id, trans)` | Perform transaction `trans` on node with `id`:

Usually the first argument is the `id` of the node. `add()` is an exception to that rule.
But optionally an `id` can be passed as second (!) argument, otherwise it's auto-generated.

All write operations always return a promise. The promise will always return
the `id` when resolved. Example:

```js
this.$models.task.add({ ... }).then(id => {
  console.log(`Task with ${id} was successfully created.`)
})
```

### Adding and updating nodes

Usually `add()` will auto-generate the id of the new node based on the `UIDMethod`,
which can be configured when creating a `GenericStore`:

```js
import { UIDMethod } from 'heliosRX'

const post = new GenericStore(
  '/post/*',
  postModelDefinition,
  {
    uidMethod: UIDMethod.TIMESTAMP,
  }
);
```

When creating a new node with `add()` now, the current timestamp will be used as
id, e.g `/posts/15348546864`.

Alternatively a new `id` can be passed as second argument to `add()`:

```js
let new_id = btoa("email@examlple.com") // Use a hashed email as id
this.$models.post.add( overwrite_data, new_id)
// Will create a node at /post/ZW1haWxAZXhhbXBsZS5jb20=

this.$models.post.update( new_id, { title: "New title" })
// Will update node and set title
```

#### Bypassing `schema.create()` when adding nodes with `add()`

`add()` calls the `create()` function of the model definition (if defined).
This is the default behaviour, when adding new data. If you want to change that
behaviour and write data directly without being passed to `create()` first, you
can set the option `directWrite` to `true`:

```js
this.$models.post.add({ title: "Title", isDone: true }, null, { directWrite: true })
```

#### Updating nested data

There is two ways to update nested data, which both have a different behaviour:

```js
this.$models.post.update( id, {
  subitem: { 'title': "New title" }
})

this.$models.post.update( id, {
  'subitem/title': "New title"
})
```

In the first case the entire subitem will be overwritten by
`{ 'title': "New title" }` in the second case only `subitem/title` is updated
(this is what you want in most cases).

### Deleting nodes

heliosRX has two delete modes:

- **Hard Delete**: Node is deleted from database and can not be recovered
- **Soft Delete**: The `deleted` field of the node is set to `True`

```js
import { DeleteMode } from 'heliosRX'

this.$models.task.remove(taskId, DeleteMode.SOFT )
this.$models.task.restore(taskId) // ...when deleted with soft delete
```

## Sorting

heliosRX supports sorting data by adding a special field called `sortidx`
(needs to be defined in the schema). There is two ways how `reorder` can be called.
Either with a list of `id's`:

```js
this.$models.task.reorder([ 'id3', 'id2', 'id1' ])
```

or with a list of objects that contain the properties `id`/`$id` and `sortidx`:

```js
this.$models.task.reorder([
  { id: 'id1', sortidx: 3 },
  { id: 'id2', sortidx: 2 },
  { id: 'id3', sortidx: 1 }])
```

This is especially usefull when passing a sorted list of `GenericModels` to `reorder()`:

```js
let list = $models.example.subscribeList()

// ... update list.items[id].sortidx (for example by drag and drop) ...

$models.example.reorder(list.itemsAsArray())
```

If you want to use another field as key for sorting, you can set the option `overwriteSortIdxKey`:

```js
this.$models.task.reorder(
  [ 'id3', 'id2', 'id1' ],
  { overwriteSortIdxKey: 'priority' })
```

::: warning Work in Progress (06/02/2020)
This section is still needs some work:
- Calculating the last sort index
- Multiple sort indices
- Drag & Drop example
:::

## Transaction

To perform a transaction on `field` for node with `id`.
Basic syntax:

```js
$models.example.transaction( <id>, <field>, <transaction> )
```

Examples:

```js
this.$models.example.transaction( id, 'coins', coins => coins * 2 )
this.$models.example.transaction( id, 'coins', 'inc', 100 )
this.$models.example.transaction( id, 'coins', 'inc' ) // default: increment by 1
```

Read more here: [Transactions and batched writes](https://firebase.google.com/docs/firestore/manage-data/transactions)

## Copy and move

To copy or move an entire node between differnt paths you can use `copy()` or `move()`.
The basic syntax for both is:

```js
$models.example.copy( <id>, <contextA>, <contextB> )
$models.example.move( <id>, <contextA>, <contextB> )
```

where context is an object that fully defines the source path (A) and destination path (B):

- `contextA` (object) - id's of the source path
- `contextB` (object) - id's of the destination path

For example:

```js
const task = GenericStore('/user/{userId}/task/*', ...)
// ...
//
this.$models.task.copy( '234',
  { userId: 'A' },
  { userId: 'B' }
);
```

This would copy a task from `/user/A/task/234` to `/user/B/task/234`.

```js
const comment = GenericStore('/user/{userId}/task/{taskId}/comment/*', ...)

this.$models.comment.move( '789',
  { userId: 'A', taskId: '234' },
  { userId: 'B', taskId: '234' }
);
```

This would move a comment from `/user/A/task/234/comment/789` to `/user/B/task/234/comment/789`.

Usually move will generate a new `id`. If you don't want this behaviour, you can
set the option `keepId` to `true`.

```js
this.$models.example.move(id,
  { userId: 'A', taskId: 234 },
  { userId: 'B', taskId: 234 },
  { keepId: false }
)
```

<!--
::: warning Work in Progress (06/02/2020)
This section is still a work in progress. It will be updated soon.

This section will cover these use cases:

- Create / Update Modal
- Table / List
- Reorder / Drag & Drop
:::
-->
