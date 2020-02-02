<h1 align="center">heliosRX</h1>

![heliosRX](./docs/docs/.vuepress/public/helios-rx.png)

<p align="center">
  <a href="http://badge.fury.io/js/heliosrx">
    <img src="https://badge.fury.io/js/heliosrx.svg" alt="NPM" />
  </a>
  <a href="https://github.com/heliosrx/heliosrx/pulse">
    <img src="https://img.shields.io/github/commit-activity/m/heliosrx/heliosrx" alt="Activity" />
  </a>
  <a href="https://github.com/heliosRX/heliosRX/actions?query=workflow%3ACI" >
    <img src="https://github.com/heliosRX/heliosRX/workflows/CI/badge.svg?branch=master" alt="CI" />
  </a>
  <a href="https://codecov.io/gh/heliosRX/heliosRX" alt="Codecov">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/gh/heliosrx/heliosrx">
  </a>
  <a href="https://discord.gg/2Hg3eq">
    <img src="https://img.shields.io/discord/655646290507464743?label=discord&logo=discord" alt="Discord"/>
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=helios_rx">
    <img src="https://img.shields.io/twitter/follow/helios_rx?style=social&logo=twitter" alt="Follow on Twitter">
  </a>
</p>

**heliosRX** is a front-end ORM (Object-Relational Mapping) layer
for reactive real-time web applications using Firebase Realtime Database and Vue.

<!-- - 🗃️ **Firebase ORM** Object Relation Management for Firebase Realtime Database. -->
- 🍭 **Firebase ORM** Elegant abstraction layer for Firebase Realtime Database.
- 🍱 **Model based state management** Declare models with reactive getters and custom actions.
- ♻️ **One Codebase** Generate Frontend API and Backend API from one Codebase.
- ⚡  **Faster development** Significantly reduced development time.

The basic idea behind heliosRX is:

> Describe your data structures by providing a schema. Based on that schema heliosRX will generate a client (with automatic client-side validation) and a server ( = security rules).

## Documentation

- **[Full Documentation](https://heliosrx.github.io)**

## When should I use heliosRX?

If you're using Firebase as your backend and if you're building something that
is a little bit more complex then just a simple to-do list, then heliosRX is
probably very useful for you. Some reasons why you might chose heliosRX over just Firebase
Client API are:

- ➡️ You want to develop a SPA with Vue and Firebase
- ➡️ You want object oriented state management
- ➡️ You want to write significantly less code
- ➡️ You want consistent data validation on client and server
- ➡️ You want an additional layer of abstraction and therfore less vendor lock-in
- ➡️ You want automatic type conversion for timestamps

heliosRX will likely support other backends in the future.

You can read more about it in the [announcement post](https://tw00.dev/post/heliosrx/annoucement/).

## Install

1. Install with npm

```bash
npm install --save heliosrx
```

2. Install with yarn

```bash
yarn add heliosrx
```

heliosRX comes with a CLI:

```bash
npm install -g heliosrx-cli
# - or -
yarn global add heliosrxc-cli
```

heliosRX requires `bolt-compiler` as a peer dependency, so please run:

```bash
npm install -g bolt-compiler
# - or -
yarn add -g bolt-compiler
```

## Configuration

Before you can start using heliosRX, you have to configure Firebase and heliosRX.
Usually, this should be pretty straight forward. You can read more in the
[documentation](https://heliosrx.github.io/guide/03-configuration.html).

### Configure Firebase Realtime Database

This is really up to you, but one way to do it, is to get your Firebase
configuration and put it in a new file in `src/firebase.js` that looks
something like this:

```js
// file: src/firebase.js

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey:            "<YOUR API KEY>",
  authDomain:        "<YOUR AUTH DOMAIN>",
  databaseURL:       "<YOUR DATABASE URL>",
  projectId:         "<YOUR PROJECT ID>",
  storageBucket:     "<YOUR STORAGE BUCKET>",
  messagingSenderId: "<YOUR MESSAING SENDER ID>",
  appId:             "<YOUR APP ID>"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime DB
export const rtdb = firebase.database();
```

Please feel free to do this in a way that suits your needs best.
The important thing here is that we need to import `rtdb` later on,
which is why we're exporting it here.

### Create folder structure and configuration files

Next, create the following folder structure:

```
├── rules               - Used for database access rules
│   └── rules.bolt      - Default access rules
└── src
    └── models
        ├── config.js   - Models are assigned to DB paths here
        └── *           - Model definitions (Can be accessed through this.$models)
```

by running

```bash
helios init
```

which will create these files and folders automatically.

### Add heliosRX to your main.js

```js
import Vue from 'vue'
import heliosRX from 'heliosRX'
import { rtdb } from './firebase' // Import realtime database
import models from '@/models'

Vue.use(heliosRX, {
  userModels:  models, // 'src/models',
  firebaseDb:  rtdb
  devMode:     true,
})

...

new Vue({
  render: h => h(App)
}).$mount('#app');
```

## Quickstart

This is an example of a simple To-Do app:

- [Demo](https://heliosrx-demo1.web.app/)

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
> helios rules --write <output-file>

type Task {
  title: String
  createdAt: ServerTimestamp | Null
  isDone: Boolean | Null
}
...
```

## Changelog
See [CHANGELOG.md](./CHANGELOG.md).

## Related

- [vuefire](https://github.com/vuejs/vuefire)
- [Vuex ORM](https://github.com/vuex-orm/vuex-orm)
  - Vuex ORM takes a similar approach, but has no Firebase backend

## Pull request

I'd be happy to review any pull requests that may better the heliosRX project, in particular, if you have a bug fix or enhancement. Before doing so, please first make sure that all of the tests pass (yarn test).

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Thomas Weustenfeld
