---
home: true
heroImage: /logo.png
actionText: Get started →
actionLink: /guide/intro/intro
heroText:
tagline: Firebase Realtime Database + Vue + ORM = 🔥
features:
- title: 🗃️ Firebase ORM
  details: Object Relation Management for Firebase Realtime Database.
- title: ♻️ One codebase
  details: Generate Frontend API and Backend API from one codebase.
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

<spacer padding="1rem" />

### 1. Define a Schema

```js
const taskModelDefinition = {
  schema: {
    fields: {
      title:     { type: 'String', required: true },
      createdAt: { type: 'ServerTimestamp' },
      isDone:    { type: 'Boolean' },
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
      <a href="#" @click.prevent="onDeleteTask( task )">del</a>
    </li>
    <input v-model="title" />
    <button @click="onAddTask">add</button>
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
      task = task.clone()
      task.isDone = !task.isDone;
      task.write();
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
