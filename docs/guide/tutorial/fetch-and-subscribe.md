# Retrieving data

There is two ways to retrieve data in heliosRX (and Firebase). Either as a
contiouns stream of data (`subscribe`) or as one time event (`fetch`).
In the first case data will continously be synced from Realtime Database.
In the second case data is only retrieved once and not synced any further.

|                   |             sync |       fetch (same syntax) | _return type_
|-------------------|------------------|--------------|-------------------------
| list (collection) | `subscribeList`  |  `fetchList` | *`GenericList`*
| filtered list     | `subscribeQuery` | `fetchQuery` | *`GenericList`*
| node (document)   | `subscribeNode`  |  `fetchNode` | *`GenericModel`*

Both subscribe and fetch exists for nodes (or documents) and lists (or collections)
of data. A special case of a list is a query. A query returns a list that
has been filtered on the server according to certain criteria

While `subscribeList` will return everything under the node `tasks`:

```
/tasks/*  -->  $models.task.subscribeList()
```

`subscribeNode` will only return one item:

```
/tasks/1  -->  $models.task.subscribeNode(1)
```

<!-- = GenricList pointing to -->
<!-- = GenricModel pointing to -->

`fetchList` and `subscribeList`, `fetchQuery` and `subscribeQuery`, `fetchNode` and `subscribeNode` have identical syntax and can be used interchangeably.


## Working with lists

One way to retrieve data is to define a new variable in the `this` scope, during
the `created` or `mounted` lifecycle hooks:

```js
  data() {
    return {}
  },
  created() {
    let task_list = this.$models.task.subscribeList();
    this.task_list = task_list;

    this.task_list.$promise.then(() => {
      // all tasks have been loaded
    })
  }
```

There is no need to define `task_list` in `data()` in order to make it reactive.
Return values of `subscribeNode` / `subscribeList` / `subscribeQuery` are always reactive by themselves.

Another way is to return a `GenericList` directly from a computed property:

```js
  computed: {
    task_list() {
      return this.$models.task.subscribeList();
    }
  }
```

In both cases `task_list` will be available in the template:

```html
<template>
  <div v-if="task_list.$readyAll">
    {{task_list.items}}
  </div>
</template>
```

Some other useful properties you can use at this moment are:

| Properties       |    Type | Description
|------------------|---------|--------------------------------------------------
| `.items`         | Object  | Map from `id` to `GenricModel` (whereas id is: `/example/<id>`)
| `$readyAll`      | Boolean | Becomes `true` when *all* children are ready (downloaded)
| `$readySome`     | Boolean | Becomes `true` when *some* children are ready (downloaded)
| `$promise`       | Promise | A promise that will resolve, when $readyAll is `true`
| `$numReady`      | Numeric | Number of children that are ready (downloaded)
| `$numChildren`   | Numeric | Number of children
| `$noaccess`      | Boolean | Did the user have permission
| `$idList`        | Array   | List of all child id's (whereas id is: `/example/<id>`)

<!-- | `$itemsSorted`   | ... -->

GenericList's also provide some basic filter and sort functions, that return a array instead of an object. When data children are returned as array the `id` can still be accessed through `items[0].$id`.

| Array helper functions           | Returns `.items` as array...
|----------------------------------|--------------------------------------------
| `asArraySorted()`                | ... and sorted by the field `sortidx`
| `asArraySortedBy(prop)`          | ... and sorted by `<prop>`
| `asArrayFilteredBy(prop, value)` | ... and filtered by `<prop> == value`
| `itemsAsArrayWithoutDeleted()`   | ... but without deleted (field `deleted` is false)
| `itemsAsArrayOnlyDeleted()`      | ... but only deleted

Keep in mind theat these functions filter data **locally**. If you want to filter
or order data on the server side considere using a query.

## Working with queries

The basic syntax for `subscribeQuery` is the same as `subscribeList`, but it takes
an additional argument `query` which is an object:

```js
let list = subscribeQuery(query); // Returs 'GenricList'
```

For example, if you want to get all tasks, that were created after timestamp `123456789`
and limit the result to `100` children you could run the following query:

```js
this.$models.task.subscribeQuery({
  key:     'createdAt',
  startAt: 123456789,
  limit:   100
});
```

The properties of `query` are mapped to native Firebase functions like this:

|                 heliosRX |              Firebase | Comment
|--------------------------|-----------------------|----------------------------
| `no key`                 | `orderByKey()`        | No index needed. Key is always indexed
| `{ key: '*' }`           | `orderByValue()`      | [1]
| `{ key: <key> }`         | `orderByChild(<key>)` | [2]
| `{ value: <value> }`     | `equalTo(<value>)`    | Depends on the order-by method chosen
| `{ startAt: <start> }  ` | `startAt(<start>)`    | Read [this](https://firebase.google.com/docs/database/web/lists-of-data#data-order) on data ordering
| `{ endAt: <end> }`       | `endAt(<end>)`        | -
| `{ limit: 100 }`         | `limitToFirst(100)`   | -
| `{ limit: -100 }`        | `limitToLast(100)`    | -
| `-`                      | `orderByPriority()`   | *Not available*

- [1] `orderByValue`: Don't forget to add `indexOn( [ '.value' ] )`
- [2] `orderByChild`: Don't forget to add `indexOn( [ <key> ] )`

For more information please read the Firebase Docs:

- [Work with Lists of Data on the Web](https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data)
- [firebase.database.Query](https://firebase.google.com/docs/reference/js/firebase.database.Query)

## Working with single nodes

Nodes can be retrieved in the same way as lists, but an `id` has to be provided:

```js
{
  props: {
    taskId: { required: true },
  },
  computed() {
    task() {
      return this.$models.task.subscribeNode( this.taskId );
    }
  },
  watch: {
    'task.$ready' () {
      // task is ready
    }
  },
}
```

Also a task instance can be created in one of the lifecycle hooks. This is especially
useful if the component is responsible for writing data (like modals or forms):

```js
  data() {
    return {
      taskId: '1',
    }
  },
  created() {
    let task = this.$models.task.subscribeNode( this.taskId );
    this.task = task.clone();

    this.task_list.$promise.then(() => {
      // task is ready
    })
  },
  methods() {
    this.task_list.write()
  }
```

`GenericModels` will have autogenerated props that wrap around the actual state (`$state`).
For example the following schema

```js
export default {
  fields: {
    title:     { type: 'String', required: true },
    createdAt: { type: 'ServerTimestamp' },
    isDone:    { type: 'Boolean' },
  },
};
```

will produce the following auto-generated getters and setters:

| Properties    |    Type | Description
|---------------|---------|--------------------------------------------------
| `title`       | String  | Title (getter/setter for `$state.title`)
| `createdAt`   | moment  | Converted to [moment.js](https://momentjs.com/) object
| `isDone`      | Boolean | isDone (getter/setter for `$state.isDone`)

Some other useful properties from `GenericModel` taht you can use are:

| Properties    |    Type | Description
|---------------|---------|--------------------------------------------------
| `$id`         | String  | `id` of the node (whereas id is: `/example/<id>`)
| `$idx`        | Numeric | A numeric index of the node if node is child element of a list
| `$key`        | String  | A unique key that can be used with `v-for`
| `$ready`      | Boolean | Boolean that becomes `true` when node is ready (downloaded)
| `$promise`    | Promise | A promise that will resolve, when $ready is `true`
| `$state`      | Object  | The raw state
| `$dirty`      | Object  | Object of fields that have been changed but not saved
| `$invalid`    | Object  | Object of fields that are invalid
| `$isValid`    | Boolean | Whether the current state is valid (all props are valid) or not
| `$exists`     | Boolean | Whether the node existed in the database or not


Finally data can be written to the database with these methods:

| Methods       | Description
|---------------|--------------------------------------------------
| `clone()`     | Required when data is changed locally. Creates a clone of the GenericModel.
| `write()`     | Write dirty fields to database (usually requires `clone()`)
| `update()`    | Directly update fields in the database. Syntax:<br>`task.update(id, { isDone: true })`


<!--
::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.
This section should also cover:

- Denormalize / Join data
:::
-->
