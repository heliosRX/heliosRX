# Custom getters & actions

::: warning Work in Progress (20/1/2020)
This section is still a work in progress. It will be updated soon.
:::


### Extended model definition

```
└── models
    └── tasks
        ├── schema.js   -
        ├── getters.js  -
        └── actions.js  -
```

### src/model/taskSession/index.js
```js
import * as getters from './getters'
import * as actions from './actions'
import * as schema from './schema'

export default {
  modelGetters: {},
  modelActions: {},
  listGetters: {},
  listActions: {},
  staticGetters: getters,
  staticActions: actions,
  schema: schema,
};
```

### src/model/taskSession/schema.js
```js

export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      a:             0,
      b:             name,
    };
  },

  fields: [
    { model: 'a', type: 'Number' },
    { model: 'b', required: true },
    { model: 'long_name',  abbrv: 'ln' },
    { model: 'short_name', abbrv: 'sn' }
    ...
  ],

  // - or -

  fields: {
    createdAt: {
      type: 'ServerTimestamp',
    },
    name: {
      validator: () => true,
      type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      type: 'String',
      validate: v => v.length < 30
    },
    b: {
      type: 'Boolean',
      validator: () => true
    },
    someNumber: {
      type: 'Number',
      validator: () => true
    },
  },
};
```

### src/model/taskSession/actions.js
```js
export default {
  my_action({ $store, $models }, goalId ) {
    // ...
  }
}
// Usage in component: this.$models.taskSession.my_action( 123 )
```

### src/model/taskSession/getters.js
```js
export default {
  my_getter: ($models, $registry, $store) => {
    // ...
  }
}
// Usage in component: this.$models.taskSession.getters.my_getter
```

### src/model/taskSession/schema.bolt
```js
type {NAME_PLACEHOLDER} {
  {FIELDS_PLACEHOLDER}
}

type UserDayplanSessionsTask {
  taskId: String | Null,
  from: Timestamp | Null,
  duration: Number | Null,
  cachedTitle: String | Null,
  cachedFinishedAt: Timestamp | Null
}
```

### How to use the model

```html
<template>
  <div v-if=”hours.$ready”>...display hours...</div>
  <div v-if=”goals.$ready_all”>
    <goal-details
      v-for="goal in goals"   // auto-generated iterator - currently not possible
      :key="goal.$key"        // auto-generated key - done
      :goal="goal" />
    <button @click="onAddGoal">Add goal</button>
  </div>
  <div v-if=”challenges.$ready_some”>
    <challenge v-for="challenge in challenges" ...>...</challenge>
    <button @click="this.page++">Next page</button>
  </div>
</template>

<script>
export default {
  computed: {

    /* Example list */
    goals() {
      let goals = this.$models
        .goal_meta               // model name
        .with({ uid: myUserId }) // uid is auto-defined if not set explicitly
        .subscribeList()

      // .subscribeNode(id) .subscribeList()
      // .syncNode(id)      .syncList()
      // .fetchNode(id)     .fetchList()

      return hours;
    },

    /* Example getter */
    hours() {
      let hours = this.$models
        .timeslot_collection                    // model name
        .aggregated_timeslot_collection_hours({ // proxied to getter
          from: 10,                             // getter arguments (for caching)
          to:   20
        }, {                                    // options
          caching: false
        });

      return hours;
    },

    /* Example Queries / Pagination */
    challenges() {
      let challenges = this.$models.challenges.fetchQuery({
        start: this.page,
        limit: 10
      });

      return challenges;
    }

    /* Example Helper (shortcut) */
    ...mapReady('goals') // Auto-generates $ready_goals
  },
  methods: {
    onGoalAdd() {
      this.$models.goal_meta.add({ name: 'Unnamed goal' })

      // - or -

      let goal = this.$models.goal_meta.new_from_template()
      goal.doSomethingFancy() // custom action
      goal.write() // write to DB
    },

    onUpdateGoal() {
      let goal = this.$models.goal_meta.load()
      goal.doSomethingFancy() // custom action

      // - or -

      goal.nested.value = 15;
      goal.write({ debounce: 600 })
    },

    onMove() {
      this.$models.goal_meta.move({ goalId: 1 }, { uid: A }, { uid: B })
    },
  }
),
</script>
```
