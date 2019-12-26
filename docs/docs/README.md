---
home: true
heroImage: /logo.png
actionText: Get started →
actionLink: /guide/01-intro
heroText:
tagline: Firebase Realtime Database + Vue + ORM = 🔥
features:
- title: 🗃️ Firebase ORM
  details: Object Relation Management for Firebase Realtime Database.
- title: ♻️ One Codebase
  details: Generate Frontend API and Backend API from one Codebase.
- title: ⚡ Faster development
  details: Significantly reduced development time of complex realtime applications.
meta:
- title: heliosRX
- name: description
  content: heliosRX is a front-end ORM (Object-Relational Mapping) layer for reactive real-time web applications using Firebase Realtime Database
- name: keywords
  content: heliosrx orm firebase vue vuex
footer: MIT Licensed | Copyright © Thomas Weustenfeld - 2019 (@tw00)
---

<spacer padding="0rem" />

**heliosRX** is a front-end Object-Relational Mapping layer
for reactive real-time web applications using Firebase Realtime Database.
<!-- heliosRX allows developers to define models, schemata. -->

<spacer padding="1rem" />

<!--
<split display-text="Test">
**fooar** xxx
</split>
-->

### 1. Define a Schema

```js
const taskModelDefinition = {
  schema: {
    fields: {
      title:     { validate_bolt_type: 'String', required: true },
      createdAt: { validate_bolt_type: 'ServerTimestamp' },
      isDone:    { validate_bolt_type: 'Boolean' },
    }
  }
};

export const task = new GenericStore( '/user/{userId}/task/*', taskModelDefinition );
```

### 2. Use auto-generated API

```html
<template>
  <!-- Example: Simple To-Do App -->
  <ul>
    <li v-for="task in tasks.items" :key="task.$key">
      <input type="checkbox" @input="onCheckTask( task )">
      {{task.title}}
      <a href="#" @click.prevent="onDeleteTask( task )" />
    </li>
    <input v-model="title" />
    <button @click="onAddTask" />
  </ul>
</template>

<script>
export default {
  data() {
    return {
      title: ""
    }
  },
  computed: {
    tasks() {
      return this.$models.task.subscribeList();
    }
  },
  methods: {
    onCheckTask( task ) {
      task.isDone = !task.isDone;
      task.save();
      // or: this.$models.task.update( task.$id, { isDone: !task.isDone } )
    },
    onAddTask() {
      this.$models.task.add({
        title: this.title
      });
    },
    onDeleteTask( task ) {
      task.remove();
      // or: this.$models.task.remove( task.$id );
    }
  }
}
</script>
```

### 3. Generate Security Rules automatically

```bash
> helios rules

type Task {
  title: String
  createdAt: ServerTimestamp | Null
  isDone: Boolean | Null
}
...
```

<!--
More benefits are:

- 🏢 Used in production
- ♻️ Use code for backend and frontend
- 🍭 Easy to use abstraction layer for firebase
- ⚡ Speeds up development significantly
- 🔌 Modular architecture (will support other backends in the future)
- ⏱️ Write fully reactive Realtime Apps
-->

<!--
- ❤️ asdkmaksldsa
- ❤️ asdkmaksldsa
- ❤️ asdasd
-->
