# Cheat sheet

TODO: Move to guide, keep simple example here?

#### Type definition

```js
// file: src/models/example/index.js
import getters from './getters'
import actions from './actions'
import schema from './schema'

export default {
  modelGetters: {},         // Define additional getters for model instances
  modelActions: {},         // Define additional actions for model instances
  listGetters: {},          // Define additional getters for lists
  listActions: {},          // Define additional actions for lists
  staticGetters: getters,   // Define global getters for the store
  staticActions: actions,   // Define global actions for the store
  schema: schema,           // Define model schema
};
```

- **Schema `schema.js`**:

```js
// file: src/models/example/schema.js
import moment from 'heliosrx/src/moment'

export default {

  create_required: [ 'name' ], // ???
  create({ name }, data, BACKEND) {
    return {
      createdAt:     moment.currentTimeServer(BACKEND),
      name:          name,
      someNumber:    data.someNumber || null,
    };
  },

  fields: [
    createdAt: {
      validate_bolt_type: 'ServerTimestamp',
    },
    name: {
      validate_bolt_type: 'String',
      required: true,
      validate: v => v.length < 30
    },
    someNumber: {
      validate_bolt_type: 'Number',
    },
  ],
};
```

- **Getters `getters.js`**:

```js
// file: src/models/example/getters.js
export default {
  mygetter: ( $models, $registry, $store ) => {
    // ...
  }
}

$models.example.getters.mygetter
```

- **Actions `actions.js`**:

```js
// file: src/models/example/actions.js
export default {
  doSomethingFancy({ $store, $models }) {
    // ...
  },
  doAction({ $store, $models }, id) {
    // ...
  },
}

$models.example.doSomethingFancy()
$models.example.doAction('0123456789')
```

- **Bolt definition `schema.bolt`**:
```js
// file: src/models/example/schema.bolt
type Example {
  {FIELDS_PLACEHOLDER}
}
```

#### Data types

```
validate_bolt_type:
String
Boolean
Number
...
```


#### Creating a new store

```js
// --- Creating a generic store:

// Normal list:
challenge = new GenericStore(
  '[DB1]:/challenge/*',
  ChallengeTypeDefinition,
  { custom_key: timestamp }
);

// Nested list:
task_session_list = new GenericStore(
  '/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*',
  TaskSessionTypeDefinition
);

// Suffixed store:
goal_meta = new GenericStore(
  '/goal/*/meta',
  GoalMetaTypeDefinition
);
goal_meta.add() // -> creates a new goal at /goal/<newId>/meta

// Store with alternative unique id method:
new GenericStore(
  "/path/to/{otherId}/data/*",
  myModelDefinition,
  { uidMethod: uidMethods.SLUGID }
);
```

Example: Non suffixed paths

```js
goal_deadline_list = new GenericStore(
  '/goal/{goalId}/meta/deadlines/*',
  GoalMetaTypeDefinition
);
goal_deadline_list
  .with({ goalId: 'KrZPg8N6THOisFz_T992Zg' })
  .add({ title: 'My deadline' })
```

#### Defining the path

```js
// -- Defining the path

let task_session_list_defined = task_session_list.with({
  goalId: 'KrZPg8N6THOisFz_T992Zg',
  uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
})
//> /goal/KrZPg8N6THOisFz_T992Zg/user_list/l1X8FPc7YtbftlC31frciInV3PU2/task_session_list/{taskId}/*
```

#### Writing data

```js
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

// ...
```

#### Retrieving data:

```js
// Lists
challenge.subscribeList()       // Subscribe to list at path and listen for changes
challenge.subscribeQuery({...}) // Subscribe using a query
challenge.fetchList()           // Get GenericLists from Cache
challenge.getList()             // Fetch GenericLists once

// Nodes
challenge.subscribeNode(id) // Subscribe to node at path and listen for changes
challenge.fetchNode(id)     // Fetch GenericModel once
challenge.getNode(id)       // Get GenericModel from Cache

```
<!--
let syncId1 = task_session_list.sync(target, { taskId: '123' })
let syncId2 = task_session_list.sync_add(target, { taskId: '234' })
task_session_list.sync_rem(syncId1)
-->
