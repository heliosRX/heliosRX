# Cheat sheet / Quick ref

The generic store provides a unified API to the database.

Create store with different UID method.

```js
new GenericStore(
  "/path/to/{otherId}/data/*",
  myModelDefinition,
  { uidMethod: uidMethods.SLUGID }
)
```

Examples:

```js
// --- Creating a generic store:

// Normal list:
challenge = new GenericStore('[DB1]:/challenge/*', ChallengeTypeDefinition, { custom_key: timestamp });

// Nested list:
task_session_list = new GenericStore(
 '/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*',
 TaskSessionTypeDefinition
)

// -- Defining the path
let task_session_list_defined = task_session_list.with({
  goalId: 'KrZPg8N6THOisFz_T992Zg',
  uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
})

// --- Writing data:

// Add items
challenge.add({ title: 'Name' })
challenge.add(overwrite_data)

// Update items
challenge.update(id, { key: value })
challenge.update(id, [{ key1: value1 }, { key2: value2 }, ...])

// Reorder items
challenge.reorder(...)

// Remove items
challenge.remove(id)
challenge.remove(id, true) // Soft delete

// --- Retrieving data:

// Lists
challenge.subscribeList()       // Subscribe to list at path and listen for changes
challenge.subscribeQuery({...}) // Subscribe using a query
challenge.fetchList()           // Get GenericLists from Cache
challenge.getList()             // Fetch GenericLists once

// Nodes
challenge.subscribeNode(id) // Subscribe to node at path and listen for changes
challenge.getNode(id)       // Get GenericModel from Cache
challenge.fetchNode(id)     // Fetch GenericModel once

let syncId1 = task_session_list.sync(target, { taskId: '123' })
let syncId2 = task_session_list.sync_add(target, { taskId: '234' })
task_session_list.sync_rem(syncId1)
```

Example: Suffixed paths

```js
goal_meta = new GenericStore('/goal/ * /meta', GoalMetaTypeDefinition)
goal_meta.add() // -> creates a new goal at /goal/<newId>/meta
```

Example: Non suffixed paths

```js
goal_deadline_list = new GenericStore('/goal/{goalId}/meta/deadlines/*', GoalMetaTypeDefinition)
goal_deadline_list
  .with({ goalId: 'KrZPg8N6THOisFz_T992Zg' })
  .add({ title: 'My deadline' })
```
